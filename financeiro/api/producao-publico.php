<?php
require_once 'cors.php';
require_once 'db_config.php';
require_once 'producao_lib.php';

$pdo = getDBConnection();
producaoEnsureSchema($pdo);

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$token = trim($_GET['token'] ?? ($input['token'] ?? ''));
$action = $_GET['action'] ?? ($input['action'] ?? '');

function pubFail(string $msg, int $code = 400) {
    http_response_code($code);
    echo json_encode(['error' => $msg]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'catalogo') {
    $servicos = producaoServicosBriefingPublico();
    $campos = [];
    foreach ($servicos as $s) {
        $campos[$s['slug']] = producaoBriefingCampos($s['slug']);
    }
    echo json_encode(['servicos' => $servicos, 'campos' => $campos]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'pedido') {
    if (trim((string)($input['website'] ?? '')) !== '') {
        echo json_encode(['ok' => true, 'public_token' => bin2hex(random_bytes(8))]);
        exit;
    }
    $servico = producaoServicoPorSlug(trim((string)($input['servico_slug'] ?? 'arte_avulsa')));
    if (!$servico || $servico['slug'] !== 'arte_avulsa') pubFail('Por enquanto o briefing público é só de arte avulsa');
    $nome = trim((string)($input['nome_cliente'] ?? ''));
    if (strlen($nome) < 2) pubFail('Informe seu nome');
    $whatsapp = preg_replace('/\D+/', '', (string)($input['whatsapp'] ?? '')) ?? '';
    if (strlen($whatsapp) < 10) pubFail('Informe um WhatsApp válido');
    $respostas = $input['respostas'] ?? [];
    if (!is_array($respostas)) pubFail('Respostas inválidas');
    foreach (producaoBriefingCampos($servico['slug']) as $campo) {
        if (!empty($campo['required']) && trim((string)($respostas[$campo['key']] ?? '')) === '') {
            pubFail('Preencha: ' . $campo['label']);
        }
    }
    $respostas['contato_whatsapp'] = $whatsapp;
    $titulo = $servico['nome'] . ' — ' . $nome;
    $tokenNovo = producaoToken();
    $ins = $pdo->prepare('
        INSERT INTO producao_jobs
        (cliente_id, nome_cliente, tipo, servico_slug, servico_nome, titulo, metodo_pagamento, status, public_token, pagamento_cliente)
        VALUES (NULL, ?, "avulso", ?, ?, ?, "pix", "aguardando_atribuicao", ?, "pendente")
    ');
    $ins->execute([$nome, $servico['slug'], $servico['nome'], $titulo, $tokenNovo]);
    $jobId = (int)$pdo->lastInsertId();
    $pdo->prepare('INSERT INTO producao_briefings (job_id, respostas, preenchido_em) VALUES (?, ?, NOW())')
        ->execute([$jobId, json_encode($respostas, JSON_UNESCAPED_UNICODE)]);
    producaoNotificarGestao($pdo, $jobId, 'Novo briefing do cliente', $nome . ' — ' . $servico['nome']);
    echo json_encode([
        'ok' => true,
        'public_token' => $tokenNovo,
        'status' => 'aguardando_atribuicao',
        'status_label' => producaoStatusLabel('aguardando_atribuicao'),
    ]);
    exit;
}

if ($token === '') pubFail('Link inválido', 404);
$job = producaoGetJobByToken($pdo, $token);
if (!$job) pubFail('Pedido não encontrado', 404);

$publico = [
    'titulo' => $job['titulo'],
    'nome_cliente' => $job['nome_cliente'],
    'servico_nome' => $job['servico_nome'],
    'tipo' => $job['tipo'],
    'status' => $job['status'],
    'status_label' => $job['status_label'],
    'valor' => $job['valor'],
    'metodo_pagamento' => $job['metodo_pagamento'],
    'pagamento_cliente' => $job['pagamento_cliente'],
    'briefing_campos' => $job['briefing_campos'],
    'briefing' => $job['briefing'],
    'complemento_interno_oculto' => true,
    'prazo' => $job['prazo'],
    'entregas' => [],
];

$pago = ($job['pagamento_cliente'] ?? '') === 'confirmado' || $job['status'] === 'finalizado';
$mostrarPrevia = in_array($job['status'], ['aguardando_aprovacao', 'retrabalho'], true);
$mostrarFinais = $pago && $job['status'] === 'finalizado';

if ($mostrarPrevia || $mostrarFinais) {
    $publico['entregas'] = array_map(static function ($e) use ($mostrarFinais) {
        return [
            'id' => $e['id'],
            'versao' => $e['versao'],
            'arquivo' => $e['arquivo'],
            'nome_original' => $e['nome_original'],
            'nota' => $e['nota'],
            'created_at' => $e['created_at'],
            'preview' => $mostrarFinais ? 0 : 1,
            'url' => '/api/uploads/producao/' . $e['arquivo'],
        ];
    }, $job['entregas']);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode($publico);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    pubFail('Método não permitido', 405);
}

if ($action === 'briefing') {
    if (!in_array($job['status'], ['aguardando_briefing', 'aguardando_pagamento', 'pagamento_informado'], true)) {
        pubFail('Este briefing já não pode ser alterado');
    }
    $respostas = $input['respostas'] ?? [];
    if (!is_array($respostas)) pubFail('Respostas inválidas');
    foreach (producaoBriefingCampos($job['servico_slug']) as $campo) {
        if (!empty($campo['required']) && trim((string)($respostas[$campo['key']] ?? '')) === '') {
            pubFail('Preencha: ' . $campo['label']);
        }
    }
    $json = json_encode($respostas, JSON_UNESCAPED_UNICODE);
    $ex = $pdo->prepare('SELECT id FROM producao_briefings WHERE job_id = ?');
    $ex->execute([$job['id']]);
    if ($ex->fetch()) {
        $pdo->prepare('UPDATE producao_briefings SET respostas = ?, preenchido_em = NOW() WHERE job_id = ?')
            ->execute([$json, $job['id']]);
    } else {
        $pdo->prepare('INSERT INTO producao_briefings (job_id, respostas, preenchido_em) VALUES (?, ?, NOW())')
            ->execute([$job['id'], $json]);
    }
    $novoStatus = 'aguardando_atribuicao';
    if ($job['tipo'] === 'recorrente' && $job['executor_id']) {
        $novoStatus = 'em_producao';
    }
    $pdo->prepare('UPDATE producao_jobs SET status = ? WHERE id = ?')->execute([$novoStatus, $job['id']]);
    if (!empty($job['atendente_id'])) {
        producaoNotificar($pdo, (int)$job['atendente_id'], (int)$job['id'], 'Briefing preenchido', $job['nome_cliente']);
    } else {
        producaoNotificarGestao($pdo, (int)$job['id'], 'Briefing preenchido', $job['nome_cliente']);
    }
    $job = producaoGetJobByToken($pdo, $token);
    echo json_encode(['ok' => true, 'status' => $job['status'], 'status_label' => $job['status_label']]);
    exit;
}

if ($action === 'pagar') {
    if ($job['tipo'] !== 'avulso') pubFail('Este serviço não usa Pix por job');
    if (!in_array($job['status'], ['aguardando_pagamento', 'pagamento_informado'], true)) {
        pubFail('Pagamento já tratado');
    }
    $pdo->prepare('UPDATE producao_jobs SET status = "pagamento_informado", pagamento_cliente = "informado" WHERE id = ?')
        ->execute([$job['id']]);
    if (!empty($job['atendente_id'])) {
        producaoNotificar($pdo, (int)$job['atendente_id'], (int)$job['id'], 'Cliente informou Pix', $job['titulo']);
    } else {
        producaoNotificarGestao($pdo, (int)$job['id'], 'Cliente informou Pix', $job['titulo']);
    }
    echo json_encode(['ok' => true, 'status' => 'pagamento_informado', 'status_label' => producaoStatusLabel('pagamento_informado')]);
    exit;
}

if ($action === 'aprovar') {
    if ($job['status'] !== 'aguardando_aprovacao') pubFail('Não há arte aguardando aprovação');
    $pdo->prepare('UPDATE producao_jobs SET status = "aguardando_pagamento" WHERE id = ?')
        ->execute([$job['id']]);
    if (!empty($job['atendente_id'])) {
        producaoNotificar($pdo, (int)$job['atendente_id'], (int)$job['id'], 'Prévia aprovada — cobrar', $job['titulo']);
    } else {
        producaoNotificarGestao($pdo, (int)$job['id'], 'Prévia aprovada — cobrar', $job['titulo']);
    }
    echo json_encode(['ok' => true, 'status' => 'aguardando_pagamento', 'status_label' => producaoStatusLabel('aguardando_pagamento')]);
    exit;
}

if ($action === 'alteracao') {
    if ($job['status'] !== 'aguardando_aprovacao') pubFail('Não há arte para pedir alteração');
    $recado = trim($input['recado'] ?? '');
    if ($recado === '') pubFail('Descreva o que precisa mudar');
    $pdo->prepare('UPDATE producao_jobs SET status = "retrabalho", recado_retrabalho = ? WHERE id = ?')
        ->execute([$recado, $job['id']]);
    if (!empty($job['executor_id'])) {
        producaoNotificar($pdo, (int)$job['executor_id'], (int)$job['id'], 'Cliente pediu alteração', $recado);
    }
    if (!empty($job['atendente_id'])) {
        producaoNotificar($pdo, (int)$job['atendente_id'], (int)$job['id'], 'Pedido de alteração', $job['nome_cliente']);
    }
    echo json_encode(['ok' => true, 'status' => 'retrabalho']);
    exit;
}

pubFail('Ação inválida');
