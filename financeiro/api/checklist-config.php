<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'cors.php';
require_once 'auth_helpers.php';
require_once 'db_config.php';
require_once 'db_helpers.php';

try {
    $currentUser = requireAuth();
    requireAdminOrRoot();
    $pdo = getDBConnection();
    ensureChecklistResponsavelColumn($pdo);
    ensureChecklistMensalSupport($pdo);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro interno', 'detail' => $e->getMessage()]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare("
        SELECT t.*, u.nome AS responsavel_nome, u.email AS responsavel_email
        FROM checklist_tarefas_fixas t
        LEFT JOIN usuarios u ON u.id = t.responsavel_id
        ORDER BY
          CASE t.periodicidade
            WHEN 'diaria' THEN 0
            WHEN 'segunda' THEN 1
            WHEN 'terca' THEN 2
            WHEN 'quarta' THEN 3
            WHEN 'quinta' THEN 4
            WHEN 'sexta' THEN 5
            WHEN 'mensal' THEN 6
            ELSE 9
          END,
          t.ordem ASC, t.id ASC
    ");
    $stmt->execute();
    $rows = $stmt->fetchAll();
    echo json_encode(['tarefas' => $rows]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $titulo = trim($input['titulo'] ?? '');
    $descricao = trim($input['descricao'] ?? '');
    $periodicidade = $input['periodicidade'] ?? 'diaria';
    $ordem = isset($input['ordem']) ? (int)$input['ordem'] : 1;
    $ativo = isset($input['ativo']) ? (int)(bool)$input['ativo'] : 1;
    $responsavelId = isset($input['responsavel_id']) ? (int)$input['responsavel_id'] : 0;
    $responsavelId = $responsavelId > 0 ? $responsavelId : null;
    $diaMes = checklistDiaMesValido($input['dia_mes'] ?? 0);

    $permitidas = ['diaria','segunda','terca','quarta','quinta','sexta','mensal'];
    if (!in_array($periodicidade, $permitidas, true)) {
        $periodicidade = 'diaria';
    }
    if ($periodicidade !== 'mensal') {
        $diaMes = null;
    } elseif ($diaMes === null) {
        http_response_code(400);
        echo json_encode(['error' => 'Informe o dia do mês (1 a 31)']);
        exit;
    }

    if ($titulo === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Título é obrigatório']);
        exit;
    }

    $stmt = $pdo->prepare("
        INSERT INTO checklist_tarefas_fixas (titulo, descricao, periodicidade, ordem, ativo, responsavel_id, dia_mes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $titulo,
        $descricao !== '' ? $descricao : null,
        $periodicidade,
        $ordem,
        $ativo,
        $responsavelId,
        $diaMes,
    ]);

    $id = (int)$pdo->lastInsertId();
    $stmt = $pdo->prepare("
        SELECT t.*, u.nome AS responsavel_nome, u.email AS responsavel_email
        FROM checklist_tarefas_fixas t
        LEFT JOIN usuarios u ON u.id = t.responsavel_id
        WHERE t.id = ?
    ");
    $stmt->execute([$id]);
    echo json_encode($stmt->fetch());
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $id = isset($input['id']) ? (int)$input['id'] : 0;
    if ($id < 1) {
        http_response_code(400);
        echo json_encode(['error' => 'ID é obrigatório']);
        exit;
    }

    $titulo = array_key_exists('titulo', $input) ? trim((string)$input['titulo']) : null;
    $descricao = array_key_exists('descricao', $input) ? trim((string)$input['descricao']) : null;
    $periodicidade = array_key_exists('periodicidade', $input) ? (string)$input['periodicidade'] : null;
    $ordem = array_key_exists('ordem', $input) ? (int)$input['ordem'] : null;
    $ativo = array_key_exists('ativo', $input) ? (int)(bool)$input['ativo'] : null;
    $hasResponsavel = array_key_exists('responsavel_id', $input);
    $hasDiaMes = array_key_exists('dia_mes', $input);

    $fields = [];
    $params = [];
    if ($titulo !== null) { $fields[] = 'titulo = ?'; $params[] = $titulo; }
    if ($descricao !== null) { $fields[] = 'descricao = ?'; $params[] = ($descricao === '' ? null : $descricao); }
    if ($periodicidade !== null) {
        $permitidas = ['diaria','segunda','terca','quarta','quinta','sexta','mensal'];
        if (!in_array($periodicidade, $permitidas, true)) {
            $periodicidade = 'diaria';
        }
        $fields[] = 'periodicidade = ?';
        $params[] = $periodicidade;
    }
    if ($ordem !== null) { $fields[] = 'ordem = ?'; $params[] = $ordem; }
    if ($ativo !== null) { $fields[] = 'ativo = ?'; $params[] = $ativo; }
    if ($hasResponsavel) {
        $rid = (int)$input['responsavel_id'];
        $fields[] = 'responsavel_id = ?';
        $params[] = $rid > 0 ? $rid : null;
    }
    if ($periodicidade !== null && $periodicidade !== 'mensal') {
        $fields[] = 'dia_mes = ?';
        $params[] = null;
    } elseif ($periodicidade === 'mensal' || $hasDiaMes) {
        $diaMes = checklistDiaMesValido($input['dia_mes'] ?? 0);
        if ($periodicidade === 'mensal' && $diaMes === null) {
            http_response_code(400);
            echo json_encode(['error' => 'Informe o dia do mês (1 a 31)']);
            exit;
        }
        $fields[] = 'dia_mes = ?';
        $params[] = $diaMes;
    }

    if (!$fields) {
        http_response_code(400);
        echo json_encode(['error' => 'Nenhum campo para atualizar']);
        exit;
    }

    $params[] = $id;
    $sql = "UPDATE checklist_tarefas_fixas SET " . implode(', ', $fields) . " WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Registro não encontrado']);
        exit;
    }

    $stmt = $pdo->prepare("
        SELECT t.*, u.nome AS responsavel_nome, u.email AS responsavel_email
        FROM checklist_tarefas_fixas t
        LEFT JOIN usuarios u ON u.id = t.responsavel_id
        WHERE t.id = ?
    ");
    $stmt->execute([$id]);
    echo json_encode($stmt->fetch());
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if ($id < 1) {
        http_response_code(400);
        echo json_encode(['error' => 'ID é obrigatório']);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM checklist_tarefas_fixas WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método não permitido']);

