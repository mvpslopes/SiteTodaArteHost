<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'cors.php';
require_once 'auth_helpers.php';
require_once 'db_config.php';
require_once 'db_helpers.php';

try {
    $currentUser = requireAuth();
    $pdo = getDBConnection();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro interno', 'detail' => $e->getMessage()]);
    exit;
}

function normalizarData(string $s): ?string {
    $s = trim($s);
    if ($s === '') return null;
    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $s)) {
        return $s;
    }
    if (preg_match('/^(\d{2})\/(\d{2})\/(\d{4})$/', $s, $m)) {
        return $m[3] . '-' . $m[2] . '-' . $m[1];
    }
    return null;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $dataParam = isset($_GET['data']) ? $_GET['data'] : '';
    $dataRef = normalizarData($dataParam) ?: date('Y-m-d');
    $diaSemana = strtolower(date('w', strtotime($dataRef))); // 0=domingo,1=segunda...
    $mapDia = [
        '1' => 'segunda',
        '2' => 'terca',
        '3' => 'quarta',
        '4' => 'quinta',
        '5' => 'sexta',
    ];
    $periodicidades = ['diaria'];
    if (isset($mapDia[$diaSemana])) {
        $periodicidades[] = $mapDia[$diaSemana];
    }

    $placeholders = implode(',', array_fill(0, count($periodicidades), '?'));
    $sql = "
        SELECT t.id, t.titulo, t.descricao, t.periodicidade, t.ordem,
               e.id AS exec_id, e.concluida, e.observacao
        FROM checklist_tarefas_fixas t
        LEFT JOIN checklist_execucoes e
          ON e.tarefa_fixa_id = t.id
         AND e.user_id = ?
         AND e.data_referencia = ?
        WHERE t.ativo = 1
          AND t.periodicidade IN ($placeholders)
        ORDER BY
          CASE t.periodicidade
            WHEN 'diaria' THEN 0
            WHEN 'segunda' THEN 1
            WHEN 'terca' THEN 2
            WHEN 'quarta' THEN 3
            WHEN 'quinta' THEN 4
            WHEN 'sexta' THEN 5
            ELSE 9
          END,
          t.ordem ASC, t.id ASC
    ";
    $params = array_merge([$currentUser['id'], $dataRef], $periodicidades);
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    echo json_encode([
        'data_referencia' => $dataRef,
        'tarefas' => $rows,
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $tarefaId = isset($input['tarefa_fixa_id']) ? (int)$input['tarefa_fixa_id'] : 0;
    $dataRef = normalizarData($input['data_referencia'] ?? '') ?: date('Y-m-d');
    $concluida = !empty($input['concluida']) ? 1 : 0;
    $observacao = isset($input['observacao']) ? trim($input['observacao']) : null;

    if ($tarefaId < 1) {
        http_response_code(400);
        echo json_encode(['error' => 'Tarefa obrigatória']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT id FROM checklist_tarefas_fixas WHERE id = ? AND ativo = 1");
    $stmt->execute([$tarefaId]);
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => 'Tarefa não encontrada ou inativa']);
        exit;
    }

    $stmt = $pdo->prepare("
        INSERT INTO checklist_execucoes (tarefa_fixa_id, user_id, data_referencia, concluida, observacao)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          concluida = VALUES(concluida),
          observacao = VALUES(observacao),
          updated_at = CURRENT_TIMESTAMP
    ");
    $stmt->execute([$tarefaId, $currentUser['id'], $dataRef, $concluida, $observacao ?: null]);

    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método não permitido']);

