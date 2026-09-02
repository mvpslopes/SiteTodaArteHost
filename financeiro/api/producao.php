<?php
require_once 'cors.php';
require_once 'auth_helpers.php';
require_once 'db_config.php';
require_once 'producao_lib.php';

$user = requireAuth();
$pdo = getDBConnection();
producaoEnsureSchema($pdo);

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$action = $_GET['action'] ?? ($input['action'] ?? '');

function jsonOk($data) {
    echo json_encode($data);
    exit;
}

function jsonFail(string $msg, int $code = 400) {
    http_response_code($code);
    echo json_encode(['error' => $msg]);
    exit;
}

function requireStaff(array $user) {
    if (!producaoIsStaff($user)) {
        jsonFail('Acesso negado', 403);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'servicos') {
    jsonOk(['servicos' => producaoServicos()]);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'equipe') {
    requireStaff($user);
    $stmt = $pdo->query("SELECT id, nome, email, perfil FROM usuarios WHERE ativo = 1 AND perfil IN ('root','administrador','usuario') ORDER BY nome");
    jsonOk(['equipe' => $stmt->fetchAll()]);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    requireStaff($user);
    $job = producaoGetJob($pdo, (int)$_GET['id']);
    if (!$job) jsonFail('Job não encontrado', 404);
    if (!producaoPodeVerJob($user, $job, $pdo)) jsonFail('Acesso negado', 403);
    jsonOk($job);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === '') {
    requireStaff($user);
    $status = $_GET['status'] ?? '';
    $tipo = $_GET['tipo'] ?? '';
    $fila = $_GET['fila'] ?? '';
    $sql = producaoJobSql() . ' WHERE 1=1';
    $params = [];
    if ($status !== '') {
        $sql .= ' AND j.status = ?';
        $params[] = $status;
    }
    if ($tipo === 'avulso' || $tipo === 'recorrente') {
        $sql .= ' AND j.tipo = ?';
        $params[] = $tipo;
    }
    $uid = (int)$user['id'];
    if (producaoIsFilaPropria($user) || $fila === 'minha') {
        $sql .= ' AND (j.executor_id = ? OR j.atendente_id = ? OR j.created_by = ? OR j.executante_id IN (SELECT id FROM producao_executantes WHERE usuario_id = ?))';
        $params[] = $uid;
        $params[] = $uid;
        $params[] = $uid;
        $params[] = $uid;
    }
    $sql .= ' ORDER BY FIELD(j.status, "retrabalho","aguardando_entrega","em_producao","aguardando_atribuicao","aguardando_aprovacao","aguardando_pagamento","pagamento_informado","aguardando_briefing","finalizado","cancelado"), j.id DESC';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $list = $stmt->fetchAll();
    foreach ($list as &$row) {
        $row['status_label'] = producaoStatusLabel($row['status']);
    }
    jsonOk(['jobs' => $list]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($action === '' || $action === 'criar')) {
    if (!in_array($user['perfil'], ['root', 'administrador'], true)) {
        jsonFail('Apenas gestão pode abrir job', 403);
    }
    $slug = trim($input['servico_slug'] ?? '');
    $servico = producaoServicoPorSlug($slug);
    if (!$servico) jsonFail('Serviço inválido');
    $clienteId = isset($input['cliente_id']) ? (int)$input['cliente_id'] : 0;
    $nomeCliente = trim($input['nome_cliente'] ?? '');
    if ($clienteId > 0) {
        $c = $pdo->prepare('SELECT nome FROM clientes WHERE id = ?');
        $c->execute([$clienteId]);
        $crow = $c->fetch();
        if (!$crow) jsonFail('Cliente não encontrado');
        $nomeCliente = $crow['nome'];
    }
    if ($nomeCliente === '') jsonFail('Informe o cliente');
    $titulo = trim($input['titulo'] ?? '');
    if ($titulo === '') $titulo = $servico['nome'] . ' — ' . $nomeCliente;
    $valor = isset($input['valor']) && $input['valor'] !== '' ? (float)$input['valor'] : null;
    $prazo = trim($input['prazo'] ?? '');
    $tipo = $servico['tipo'];
    if (!empty($input['tipo']) && in_array($input['tipo'], ['avulso', 'recorrente'], true)) {
        $tipo = $input['tipo'];
    }
    $metodo = $tipo === 'recorrente' ? 'boleto' : 'pix';
    $pagCliente = $tipo === 'recorrente' ? 'nao_se_aplica' : 'pendente';
    $token = producaoToken();
    $stmt = $pdo->prepare('
        INSERT INTO producao_jobs
        (cliente_id, nome_cliente, tipo, servico_slug, servico_nome, titulo, valor, metodo_pagamento, status, public_token, atendente_id, created_by, prazo, pagamento_cliente)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, "aguardando_briefing", ?, ?, ?, ?, ?)
    ');
    $stmt->execute([
        $clienteId > 0 ? $clienteId : null,
        $nomeCliente,
        $tipo,
        $servico['slug'],
        $servico['nome'],
        $titulo,
        $valor,
        $metodo,
        $token,
        (int)$user['id'],
        (int)$user['id'],
        $prazo !== '' ? $prazo : null,
        $pagCliente,
    ]);
    jsonOk(producaoGetJob($pdo, (int)$pdo->lastInsertId()));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'confirmar_pagamento') {
    if (!in_array($user['perfil'], ['root', 'administrador'], true)) jsonFail('Acesso negado', 403);
    $job = producaoGetJob($pdo, (int)($input['id'] ?? 0));
    if (!$job) jsonFail('Job não encontrado', 404);
    if ($job['tipo'] === 'recorrente') jsonFail('Cliente fixo não confirma Pix por job');
    if (!in_array($job['status'], ['aguardando_pagamento', 'pagamento_informado'], true)) {
        jsonFail('Este job ainda não está na etapa de pagamento');
    }
    if (isset($input['valor']) && $input['valor'] !== '') {
        $pdo->prepare('UPDATE producao_jobs SET valor = ? WHERE id = ?')->execute([(float)$input['valor'], $job['id']]);
    }
    $pdo->prepare('UPDATE producao_jobs SET pagamento_cliente = "confirmado", pagamento_executor = "liberado", status = "finalizado" WHERE id = ?')
        ->execute([$job['id']]);
    if (!empty($job['executor_id'])) {
        producaoNotificar($pdo, (int)$job['executor_id'], (int)$job['id'], 'Pagamento confirmado — valor liberado', $job['titulo']);
    }
    jsonOk(producaoGetJob($pdo, (int)$job['id']));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'atribuir') {
    if (!producaoPodeOperar($user)) jsonFail('Acesso negado', 403);
    $job = producaoGetJob($pdo, (int)($input['id'] ?? 0));
    if (!$job) jsonFail('Job não encontrado', 404);
    $executanteId = (int)($input['executante_id'] ?? 0);
    if ($executanteId < 1) jsonFail('Escolha quem vai fazer');
    $executante = producaoGetExecutante($pdo, $executanteId);
    if (!$executante || !(int)$executante['ativo']) jsonFail('Executante não encontrado');
    $usuarioExecutor = !empty($executante['usuario_id']) ? (int)$executante['usuario_id'] : null;
    $complemento = trim($input['complemento_briefing'] ?? '');
    $valorExec = isset($input['valor_executor']) && $input['valor_executor'] !== '' ? (float)$input['valor_executor'] : null;
    $valorCliente = isset($input['valor']) && $input['valor'] !== '' ? (float)$input['valor'] : $job['valor'];
    $atendenteId = isset($input['atendente_id']) ? (int)$input['atendente_id'] : (int)$job['atendente_id'];
    if ($atendenteId < 1) $atendenteId = (int)$user['id'];
    $pdo->prepare('
        UPDATE producao_jobs
        SET executante_id = ?, executor_id = ?, atendente_id = ?, complemento_briefing = ?, valor = ?, valor_executor = ?, status = "em_producao", recado_retrabalho = NULL
        WHERE id = ?
    ')->execute([$executanteId, $usuarioExecutor, $atendenteId, $complemento !== '' ? $complemento : $job['complemento_briefing'], $valorCliente, $valorExec, $job['id']]);
    if ($usuarioExecutor) {
        producaoNotificar(
            $pdo,
            $usuarioExecutor,
            (int)$job['id'],
            'Novo job para você',
            $job['titulo'] . ' — ' . $job['nome_cliente']
        );
    } else {
        producaoNotificarGestao(
            $pdo,
            (int)$job['id'],
            'Job atribuído a ' . $executante['nome'],
            $job['titulo'] . ' — ' . $job['nome_cliente']
        );
    }
    jsonOk(producaoGetJob($pdo, (int)$job['id']));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'entregar_cliente') {
    requireStaff($user);
    $job = producaoGetJob($pdo, (int)($input['id'] ?? 0));
    if (!$job) jsonFail('Job não encontrado', 404);
    if (!producaoPodeVerJob($user, $job, $pdo)) jsonFail('Acesso negado', 403);
    if (($user['perfil'] ?? '') === 'freelancer') jsonFail('Quem entrega ao cliente é a gestão', 403);
    if (empty($job['entregas'])) jsonFail('Ainda não há arte enviada pelo executor');
    $pdo->prepare('UPDATE producao_jobs SET status = "aguardando_aprovacao" WHERE id = ?')->execute([$job['id']]);
    jsonOk(producaoGetJob($pdo, (int)$job['id']));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'retrabalho') {
    requireStaff($user);
    $job = producaoGetJob($pdo, (int)($input['id'] ?? 0));
    if (!$job) jsonFail('Job não encontrado', 404);
    if (($user['perfil'] ?? '') === 'freelancer') jsonFail('Acesso negado', 403);
    $recado = trim($input['recado'] ?? '');
    if ($recado === '') jsonFail('Escreva o recado da alteração');
    $pdo->prepare('UPDATE producao_jobs SET status = "retrabalho", recado_retrabalho = ? WHERE id = ?')
        ->execute([$recado, $job['id']]);
    if (!empty($job['executor_id'])) {
        producaoNotificar($pdo, (int)$job['executor_id'], (int)$job['id'], 'Retrabalho', $recado);
    }
    jsonOk(producaoGetJob($pdo, (int)$job['id']));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'cancelar') {
    if (!in_array($user['perfil'], ['root', 'administrador'], true)) jsonFail('Acesso negado', 403);
    $id = (int)($input['id'] ?? 0);
    $pdo->prepare('UPDATE producao_jobs SET status = "cancelado" WHERE id = ?')->execute([$id]);
    jsonOk(producaoGetJob($pdo, $id) ?: ['ok' => true]);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'cronograma') {
    if (!in_array($user['perfil'], ['root', 'administrador'], true)) jsonFail('Acesso negado', 403);
    $clienteId = isset($_GET['cliente_id']) ? (int)$_GET['cliente_id'] : 0;
    $sql = '
        SELECT cr.*, c.nome AS cliente_nome, COALESCE(exn.nome, u.nome) AS executor_nome, cr.executante_id
        FROM producao_cronograma cr
        JOIN clientes c ON c.id = cr.cliente_id
        LEFT JOIN producao_executantes exn ON exn.id = cr.executante_id
        LEFT JOIN usuarios u ON u.id = cr.executor_id
        WHERE cr.ativo = 1
    ';
    $params = [];
    if ($clienteId > 0) {
        $sql .= ' AND cr.cliente_id = ?';
        $params[] = $clienteId;
    }
    $sql .= ' ORDER BY c.nome, cr.dia_semana, cr.id';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    jsonOk(['itens' => $stmt->fetchAll()]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'cronograma_salvar') {
    if (!in_array($user['perfil'], ['root', 'administrador'], true)) jsonFail('Acesso negado', 403);
    $id = (int)($input['id'] ?? 0);
    $clienteId = (int)($input['cliente_id'] ?? 0);
    $dia = (int)($input['dia_semana'] ?? 0);
    $titulo = trim($input['titulo'] ?? '');
    $slug = trim($input['servico_slug'] ?? 'arte_avulsa');
    $executanteId = isset($input['executante_id']) ? (int)$input['executante_id'] : 0;
    $usuarioExecutor = null;
    if ($executanteId > 0) {
        $ex = producaoGetExecutante($pdo, $executanteId);
        if (!$ex) jsonFail('Executante não encontrado');
        $usuarioExecutor = !empty($ex['usuario_id']) ? (int)$ex['usuario_id'] : null;
    } else {
        $executanteId = null;
    }
    if ($clienteId < 1 || $titulo === '' || $dia < 1 || $dia > 5) jsonFail('Preencha cliente, dia (seg–sex) e o que fazer');
    if (!producaoServicoPorSlug($slug)) jsonFail('Serviço inválido');
    if ($id > 0) {
        $pdo->prepare('UPDATE producao_cronograma SET cliente_id=?, dia_semana=?, titulo=?, servico_slug=?, executor_id=?, executante_id=? WHERE id=?')
            ->execute([$clienteId, $dia, $titulo, $slug, $usuarioExecutor, $executanteId, $id]);
    } else {
        $pdo->prepare('INSERT INTO producao_cronograma (cliente_id, dia_semana, titulo, servico_slug, executor_id, executante_id) VALUES (?,?,?,?,?,?)')
            ->execute([$clienteId, $dia, $titulo, $slug, $usuarioExecutor, $executanteId]);
        $id = (int)$pdo->lastInsertId();
    }
    $stmt = $pdo->prepare('SELECT cr.*, c.nome AS cliente_nome FROM producao_cronograma cr JOIN clientes c ON c.id = cr.cliente_id WHERE cr.id = ?');
    $stmt->execute([$id]);
    jsonOk($stmt->fetch());
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'cronograma_excluir') {
    if (!in_array($user['perfil'], ['root', 'administrador'], true)) jsonFail('Acesso negado', 403);
    $id = (int)($input['id'] ?? 0);
    $pdo->prepare('UPDATE producao_cronograma SET ativo = 0 WHERE id = ?')->execute([$id]);
    jsonOk(['ok' => true]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'gerar_semana') {
    if (!in_array($user['perfil'], ['root', 'administrador'], true)) jsonFail('Acesso negado', 403);
    $hoje = new DateTime('now');
    $diaSemana = (int)$hoje->format('N');
    $segunda = clone $hoje;
    if ($diaSemana !== 1) {
        $segunda->modify('last monday');
    }
    $semanaRef = $segunda->format('Y-m-d');
    $itens = $pdo->query('
        SELECT cr.*, c.nome AS cliente_nome
        FROM producao_cronograma cr
        JOIN clientes c ON c.id = cr.cliente_id
        WHERE cr.ativo = 1
    ')->fetchAll();
    $criados = 0;
    foreach ($itens as $item) {
        $chk = $pdo->prepare('SELECT id FROM producao_jobs WHERE cronograma_id = ? AND semana_ref = ?');
        $chk->execute([$item['id'], $semanaRef]);
        if ($chk->fetch()) continue;
        $servico = producaoServicoPorSlug($item['servico_slug']) ?: producaoServicoPorSlug('arte_avulsa');
        $token = producaoToken();
        $ins = $pdo->prepare('
            INSERT INTO producao_jobs
            (cliente_id, nome_cliente, tipo, servico_slug, servico_nome, titulo, metodo_pagamento, status, public_token, executor_id, executante_id, atendente_id, created_by, semana_ref, cronograma_id, pagamento_cliente)
            VALUES (?, ?, "recorrente", ?, ?, ?, "boleto", ?, ?, ?, ?, ?, ?, ?, ?, "nao_se_aplica")
        ');
        $executanteId = !empty($item['executante_id']) ? (int)$item['executante_id'] : null;
        $usuarioExecutor = !empty($item['executor_id']) ? (int)$item['executor_id'] : null;
        if ($executanteId && !$usuarioExecutor) {
            $ex = producaoGetExecutante($pdo, $executanteId);
            if ($ex && !empty($ex['usuario_id'])) $usuarioExecutor = (int)$ex['usuario_id'];
        }
        $status = ($executanteId || $usuarioExecutor) ? 'em_producao' : 'aguardando_atribuicao';
        $ins->execute([
            $item['cliente_id'],
            $item['cliente_nome'],
            $servico['slug'],
            $servico['nome'],
            $item['titulo'] . ' — semana ' . $segunda->format('d/m'),
            $status,
            $token,
            $usuarioExecutor,
            $executanteId,
            (int)$user['id'],
            (int)$user['id'],
            $semanaRef,
            $item['id'],
        ]);
        $jobId = (int)$pdo->lastInsertId();
        if ($usuarioExecutor) {
            producaoNotificar($pdo, $usuarioExecutor, $jobId, 'Job da semana', $item['titulo'] . ' — ' . $item['cliente_nome']);
        }
        $criados++;
    }
    jsonOk(['criados' => $criados, 'semana_ref' => $semanaRef]);
}

jsonFail('Ação inválida', 400);
