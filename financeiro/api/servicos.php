<?php
require_once 'cors.php';
require_once 'auth_helpers.php';
require_once 'db_config.php';
require_once 'db_helpers.php';

$user = requireAuth();
if (!in_array($user['perfil'] ?? '', ['root', 'administrador', 'usuario'], true)) {
    http_response_code(403);
    echo json_encode(['error' => 'Acesso negado']);
    exit;
}

$pdo = getDBConnection();
ensureCatalogoServicosTables($pdo);

function servFail(string $msg, int $code = 400) {
    http_response_code($code);
    echo json_encode(['error' => $msg]);
    exit;
}

function rowServico(array $r): array {
    return [
        'id' => (int)$r['id'],
        'slug' => $r['slug'],
        'nome' => $r['nome'],
        'categoria' => $r['categoria'],
        'descricao' => $r['descricao'],
        'detalhes' => $r['detalhes'],
        'tipo_preco' => $r['tipo_preco'],
        'valor' => $r['valor'] !== null ? (float)$r['valor'] : null,
        'unidade' => $r['unidade'],
        'ativo' => (int)$r['ativo'],
        'ordem' => (int)$r['ordem'],
    ];
}

$method = $_SERVER['REQUEST_METHOD'];
$input = in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'], true)
    ? (json_decode(file_get_contents('php://input'), true) ?: [])
    : [];

if ($method === 'GET') {
    $id = (int)($_GET['id'] ?? 0);
    $slug = trim((string)($_GET['slug'] ?? ''));
    if ($id > 0 || $slug !== '') {
        if ($id > 0) {
            $stmt = $pdo->prepare('SELECT * FROM catalogo_servicos WHERE id = ?');
            $stmt->execute([$id]);
        } else {
            $stmt = $pdo->prepare('SELECT * FROM catalogo_servicos WHERE slug = ?');
            $stmt->execute([$slug]);
        }
        $row = $stmt->fetch();
        if (!$row) servFail('Serviço não encontrado', 404);
        echo json_encode(rowServico($row));
        exit;
    }
    $ativos = !isset($_GET['ativos']) || $_GET['ativos'] !== '0';
    $sql = 'SELECT * FROM catalogo_servicos';
    if ($ativos) $sql .= ' WHERE ativo = 1';
    $sql .= ' ORDER BY ordem ASC, nome ASC';
    $rows = array_map('rowServico', $pdo->query($sql)->fetchAll());
    $cats = [];
    foreach ($rows as $r) {
        if (!in_array($r['categoria'], $cats, true)) $cats[] = $r['categoria'];
    }
    echo json_encode(['servicos' => $rows, 'categorias' => $cats]);
    exit;
}

$podeGestao = in_array($user['perfil'] ?? '', ['root', 'administrador'], true);
if (!$podeGestao && $method !== 'GET') {
    servFail('Somente gestão pode alterar o catálogo', 403);
}

if ($method === 'POST') {
    $nome = trim((string)($input['nome'] ?? ''));
    if ($nome === '') servFail('Informe o nome do serviço');
    $slug = trim((string)($input['slug'] ?? ''));
    if ($slug === '') {
        $slug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '_', iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $nome) ?: $nome));
        $slug = trim($slug, '_') ?: ('serv_' . bin2hex(random_bytes(3)));
    }
    $categoria = trim((string)($input['categoria'] ?? 'Geral')) ?: 'Geral';
    $descricao = trim((string)($input['descricao'] ?? '')) ?: null;
    $detalhes = trim((string)($input['detalhes'] ?? '')) ?: null;
    $tipo = $input['tipo_preco'] ?? 'fixo';
    if (!in_array($tipo, ['fixo', 'unitario', 'personalizado'], true)) servFail('Tipo de preço inválido');
    $valor = $tipo === 'personalizado' ? null : (isset($input['valor']) && $input['valor'] !== '' ? (float)$input['valor'] : null);
    $unidade = trim((string)($input['unidade'] ?? '')) ?: null;
    $ordem = (int)($input['ordem'] ?? 0);
    $ativo = isset($input['ativo']) ? ((int)$input['ativo'] ? 1 : 0) : 1;
    try {
        $pdo->prepare('INSERT INTO catalogo_servicos (slug, nome, categoria, descricao, detalhes, tipo_preco, valor, unidade, ativo, ordem) VALUES (?,?,?,?,?,?,?,?,?,?)')
            ->execute([$slug, $nome, $categoria, $descricao, $detalhes, $tipo, $valor, $unidade, $ativo, $ordem]);
    } catch (Throwable $e) {
        servFail('Não foi possível salvar (slug duplicado?)');
    }
    $id = (int)$pdo->lastInsertId();
    $stmt = $pdo->prepare('SELECT * FROM catalogo_servicos WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode(rowServico($stmt->fetch()));
    exit;
}

if ($method === 'PUT' || $method === 'PATCH') {
    $id = (int)($input['id'] ?? $_GET['id'] ?? 0);
    if ($id < 1) servFail('Informe o serviço');
    $chk = $pdo->prepare('SELECT id FROM catalogo_servicos WHERE id = ?');
    $chk->execute([$id]);
    if (!$chk->fetch()) servFail('Serviço não encontrado', 404);
    $nome = trim((string)($input['nome'] ?? ''));
    if ($nome === '') servFail('Informe o nome do serviço');
    $categoria = trim((string)($input['categoria'] ?? 'Geral')) ?: 'Geral';
    $descricao = trim((string)($input['descricao'] ?? '')) ?: null;
    $detalhes = trim((string)($input['detalhes'] ?? '')) ?: null;
    $tipo = $input['tipo_preco'] ?? 'fixo';
    if (!in_array($tipo, ['fixo', 'unitario', 'personalizado'], true)) servFail('Tipo de preço inválido');
    $valor = $tipo === 'personalizado' ? null : (isset($input['valor']) && $input['valor'] !== '' ? (float)$input['valor'] : null);
    $unidade = trim((string)($input['unidade'] ?? '')) ?: null;
    $ordem = (int)($input['ordem'] ?? 0);
    $ativo = isset($input['ativo']) ? ((int)$input['ativo'] ? 1 : 0) : 1;
    $pdo->prepare('UPDATE catalogo_servicos SET nome=?, categoria=?, descricao=?, detalhes=?, tipo_preco=?, valor=?, unidade=?, ativo=?, ordem=? WHERE id=?')
        ->execute([$nome, $categoria, $descricao, $detalhes, $tipo, $valor, $unidade, $ativo, $ordem, $id]);
    $stmt = $pdo->prepare('SELECT * FROM catalogo_servicos WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode(rowServico($stmt->fetch()));
    exit;
}

if ($method === 'DELETE') {
    $id = (int)($input['id'] ?? $_GET['id'] ?? 0);
    if ($id < 1) servFail('Informe o serviço');
    $pdo->prepare('UPDATE catalogo_servicos SET ativo = 0 WHERE id = ?')->execute([$id]);
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método não permitido']);
