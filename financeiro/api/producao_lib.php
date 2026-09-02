<?php
require_once __DIR__ . '/db_helpers.php';

function producaoServicos(): array
{
    return [
        ['slug' => 'logo', 'nome' => 'Criação de logotipo', 'tipo' => 'avulso', 'pagamento' => 'pix'],
        ['slug' => 'identidade', 'nome' => 'Identidade visual', 'tipo' => 'avulso', 'pagamento' => 'pix'],
        ['slug' => 'arte_avulsa', 'nome' => 'Arte avulsa', 'tipo' => 'avulso', 'pagamento' => 'pix'],
        ['slug' => 'conteudo', 'nome' => 'Criação de conteúdos', 'tipo' => 'avulso', 'pagamento' => 'pix'],
        ['slug' => 'gestao_redes', 'nome' => 'Gestão de redes sociais', 'tipo' => 'recorrente', 'pagamento' => 'boleto'],
        ['slug' => 'estrategia', 'nome' => 'Estratégia e planejamento', 'tipo' => 'avulso', 'pagamento' => 'pix'],
        ['slug' => 'marketing_digital', 'nome' => 'Marketing digital', 'tipo' => 'recorrente', 'pagamento' => 'boleto'],
        ['slug' => 'producao_visual', 'nome' => 'Produção de conteúdo visual', 'tipo' => 'avulso', 'pagamento' => 'pix'],
        ['slug' => 'performance', 'nome' => 'Marketing para vendas e performance', 'tipo' => 'avulso', 'pagamento' => 'pix'],
        ['slug' => 'trafego', 'nome' => 'Tráfego pago / mídia paga', 'tipo' => 'recorrente', 'pagamento' => 'boleto'],
        ['slug' => 'sites', 'nome' => 'Desenvolvimento de sites', 'tipo' => 'avulso', 'pagamento' => 'pix'],
    ];
}

function producaoServicoPorSlug(string $slug): ?array
{
    foreach (producaoServicos() as $s) {
        if ($s['slug'] === $slug) return $s;
    }
    return null;
}

function producaoServicosAvulsos(): array
{
    return array_values(array_filter(producaoServicos(), static fn($s) => $s['tipo'] === 'avulso'));
}

/** Coleta pública de briefing: só arte avulsa, por enquanto. */
function producaoServicosBriefingPublico(): array
{
    return array_values(array_filter(producaoServicos(), static fn($s) => $s['slug'] === 'arte_avulsa'));
}

function producaoBriefingCampos(string $slug): array
{
    $comum = [
        ['key' => 'objetivo', 'label' => 'Qual o objetivo?', 'type' => 'textarea', 'required' => true],
        ['key' => 'publico', 'label' => 'Para quem é (público / cliente final)?', 'type' => 'text', 'required' => false],
        ['key' => 'prazo', 'label' => 'Prazo ou data de uso', 'type' => 'text', 'required' => false],
        ['key' => 'referencias', 'label' => 'Referências (links, estilo, o que gosta e o que não quer)', 'type' => 'textarea', 'required' => false],
        ['key' => 'obs', 'label' => 'Observações', 'type' => 'textarea', 'required' => false],
    ];
    $extra = [];
    if (in_array($slug, ['logo', 'identidade'], true)) {
        $extra = [
            ['key' => 'nome_marca', 'label' => 'Nome da marca (como deve aparecer)', 'type' => 'text', 'required' => true],
            ['key' => 'aplicacoes', 'label' => 'Onde a marca vai ser usada?', 'type' => 'textarea', 'required' => false],
        ];
    } elseif ($slug === 'arte_avulsa' || $slug === 'conteudo') {
        $extra = [
            ['key' => 'formato', 'label' => 'Formato (post, stories, carrossel, impresso…)', 'type' => 'text', 'required' => true],
            ['key' => 'texto', 'label' => 'Textos que precisam entrar na arte', 'type' => 'textarea', 'required' => false],
        ];
    } elseif (in_array($slug, ['gestao_redes', 'marketing_digital'], true)) {
        $extra = [
            ['key' => 'redes', 'label' => 'Redes (Instagram, Facebook, TikTok…)', 'type' => 'text', 'required' => true],
            ['key' => 'tom', 'label' => 'Tom de voz da marca', 'type' => 'textarea', 'required' => false],
        ];
    } elseif ($slug === 'sites') {
        $extra = [
            ['key' => 'paginas', 'label' => 'Quais páginas o site precisa ter?', 'type' => 'textarea', 'required' => true],
            ['key' => 'dominio', 'label' => 'Já tem domínio / hospedagem?', 'type' => 'text', 'required' => false],
        ];
    }
    return array_merge($extra, $comum);
}

function producaoStatusLabel(string $status): string
{
    $map = [
        'aguardando_briefing' => 'Briefing pendente',
        'aguardando_pagamento' => 'Aguardando pagamento',
        'pagamento_informado' => 'Pagamento informado',
        'aguardando_atribuicao' => 'Aguardando atribuição',
        'em_producao' => 'Em produção',
        'aguardando_entrega' => 'Prévia pronta — enviar',
        'aguardando_aprovacao' => 'Prévia com o cliente',
        'retrabalho' => 'Alteração pedida',
        'finalizado' => 'Pago e entregue',
        'cancelado' => 'Cancelado',
    ];
    return $map[$status] ?? $status;
}

function producaoEnsureSchema(PDO $pdo): void
{
    static $done = false;
    if ($done) return;

    if (!tableExists($pdo, 'producao_jobs')) {
        $sqls = [
            "CREATE TABLE IF NOT EXISTS producao_jobs (
              id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
              cliente_id INT UNSIGNED DEFAULT NULL,
              nome_cliente VARCHAR(255) NOT NULL,
              tipo ENUM('avulso','recorrente') NOT NULL DEFAULT 'avulso',
              servico_slug VARCHAR(80) NOT NULL,
              servico_nome VARCHAR(255) NOT NULL,
              titulo VARCHAR(255) NOT NULL,
              valor DECIMAL(15,2) DEFAULT NULL,
              valor_executor DECIMAL(15,2) DEFAULT NULL,
              metodo_pagamento ENUM('pix','boleto') NOT NULL DEFAULT 'pix',
              status VARCHAR(40) NOT NULL DEFAULT 'aguardando_briefing',
              public_token VARCHAR(64) NOT NULL,
              executor_id INT UNSIGNED DEFAULT NULL,
              atendente_id INT UNSIGNED DEFAULT NULL,
              created_by INT UNSIGNED DEFAULT NULL,
              complemento_briefing TEXT DEFAULT NULL,
              recado_retrabalho TEXT DEFAULT NULL,
              prazo DATE DEFAULT NULL,
              semana_ref DATE DEFAULT NULL,
              cronograma_id INT UNSIGNED DEFAULT NULL,
              pagamento_cliente ENUM('pendente','informado','confirmado','nao_se_aplica') NOT NULL DEFAULT 'pendente',
              pagamento_executor ENUM('pendente','liberado','pago') NOT NULL DEFAULT 'pendente',
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              UNIQUE KEY uniq_producao_token (public_token),
              INDEX idx_producao_status (status),
              INDEX idx_producao_executor (executor_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
            "CREATE TABLE IF NOT EXISTS producao_briefings (
              id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
              job_id INT UNSIGNED NOT NULL,
              respostas JSON DEFAULT NULL,
              preenchido_em DATETIME DEFAULT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              UNIQUE KEY uniq_briefing_job (job_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
            "CREATE TABLE IF NOT EXISTS producao_entregas (
              id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
              job_id INT UNSIGNED NOT NULL,
              versao INT UNSIGNED NOT NULL DEFAULT 1,
              arquivo VARCHAR(255) NOT NULL,
              nome_original VARCHAR(255) DEFAULT NULL,
              nota VARCHAR(500) DEFAULT NULL,
              uploaded_by INT UNSIGNED DEFAULT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              INDEX idx_entrega_job (job_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
            "CREATE TABLE IF NOT EXISTS producao_cronograma (
              id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
              cliente_id INT UNSIGNED NOT NULL,
              dia_semana TINYINT UNSIGNED NOT NULL,
              titulo VARCHAR(255) NOT NULL,
              servico_slug VARCHAR(80) NOT NULL,
              executor_id INT UNSIGNED DEFAULT NULL,
              ativo TINYINT(1) NOT NULL DEFAULT 1,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              INDEX idx_cronograma_cliente (cliente_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
            "CREATE TABLE IF NOT EXISTS producao_notificacoes (
              id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
              user_id INT UNSIGNED NOT NULL,
              job_id INT UNSIGNED DEFAULT NULL,
              titulo VARCHAR(255) NOT NULL,
              mensagem VARCHAR(500) DEFAULT NULL,
              lida TINYINT(1) NOT NULL DEFAULT 0,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              INDEX idx_notif_user (user_id, lida)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        ];
        foreach ($sqls as $sql) {
            $pdo->exec($sql);
        }
    }

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS producao_executantes (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          nome VARCHAR(255) NOT NULL,
          tipo ENUM('executor','freelancer') NOT NULL DEFAULT 'executor',
          whatsapp VARCHAR(20) DEFAULT NULL,
          email VARCHAR(255) DEFAULT NULL,
          especialidade VARCHAR(255) DEFAULT NULL,
          usuario_id INT UNSIGNED DEFAULT NULL,
          ativo TINYINT(1) NOT NULL DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_executante_ativo (ativo),
          INDEX idx_executante_usuario (usuario_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    if (tableExists($pdo, 'producao_jobs') && !columnExists($pdo, 'producao_jobs', 'executante_id')) {
        try {
            $pdo->exec('ALTER TABLE producao_jobs ADD COLUMN executante_id INT UNSIGNED DEFAULT NULL');
            $pdo->exec('ALTER TABLE producao_jobs ADD INDEX idx_producao_executante (executante_id)');
        } catch (Throwable $e) {
        }
    }
    if (tableExists($pdo, 'producao_cronograma') && !columnExists($pdo, 'producao_cronograma', 'executante_id')) {
        try {
            $pdo->exec('ALTER TABLE producao_cronograma ADD COLUMN executante_id INT UNSIGNED DEFAULT NULL');
        } catch (Throwable $e) {
        }
    }

    ensureUsuarioPerfilFreelancer($pdo);

    $done = true;
}

function producaoIsStaff(array $user): bool
{
    return in_array($user['perfil'] ?? '', ['root', 'administrador', 'usuario', 'freelancer'], true);
}

function producaoIsFilaPropria(array $user): bool
{
    return in_array($user['perfil'] ?? '', ['usuario', 'freelancer'], true);
}

function producaoEnsureExecutanteParaUsuario(PDO $pdo, int $usuarioId, string $nome, string $email, string $tipo = 'freelancer'): void
{
    if ($usuarioId < 1) return;
    producaoEnsureSchema($pdo);
    $chk = $pdo->prepare('SELECT id FROM producao_executantes WHERE usuario_id = ? LIMIT 1');
    $chk->execute([$usuarioId]);
    if ($chk->fetch()) return;
    $label = $nome !== '' ? $nome : $email;
    $stmt = $pdo->prepare('INSERT INTO producao_executantes (nome, tipo, email, usuario_id) VALUES (?,?,?,?)');
    $stmt->execute([$label, $tipo, $email !== '' ? $email : null, $usuarioId]);
}

function producaoGetExecutante(PDO $pdo, int $id): ?array
{
    $stmt = $pdo->prepare('SELECT e.*, u.nome AS usuario_nome FROM producao_executantes e LEFT JOIN usuarios u ON u.id = e.usuario_id WHERE e.id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    return $row ?: null;
}

function producaoToken(): string
{
    return bin2hex(random_bytes(16));
}

function producaoNotificar(PDO $pdo, ?int $userId, ?int $jobId, string $titulo, string $mensagem = ''): void
{
    if (!$userId) return;
    $stmt = $pdo->prepare('INSERT INTO producao_notificacoes (user_id, job_id, titulo, mensagem) VALUES (?, ?, ?, ?)');
    $stmt->execute([$userId, $jobId, $titulo, $mensagem !== '' ? $mensagem : null]);
}

function producaoNotificarGestao(PDO $pdo, ?int $jobId, string $titulo, string $mensagem = ''): void
{
    $stmt = $pdo->query("SELECT id FROM usuarios WHERE ativo = 1 AND perfil IN ('root','administrador')");
    foreach ($stmt->fetchAll() as $u) {
        producaoNotificar($pdo, (int)$u['id'], $jobId, $titulo, $mensagem);
    }
}

function producaoJobSql(): string
{
    return "
        SELECT j.*,
               c.nome AS cliente_cadastro_nome,
               COALESCE(exn.nome, ex.nome) AS executor_nome,
               exn.tipo AS executante_tipo,
               exn.usuario_id AS executante_usuario_id,
               atn.nome AS atendente_nome,
               cri.nome AS criador_nome
        FROM producao_jobs j
        LEFT JOIN clientes c ON c.id = j.cliente_id
        LEFT JOIN producao_executantes exn ON exn.id = j.executante_id
        LEFT JOIN usuarios ex ON ex.id = j.executor_id
        LEFT JOIN usuarios atn ON atn.id = j.atendente_id
        LEFT JOIN usuarios cri ON cri.id = j.created_by
    ";
}

function producaoHydrateJob(PDO $pdo, array $job): array
{
    $job['status_label'] = producaoStatusLabel($job['status']);
    $job['briefing_campos'] = producaoBriefingCampos($job['servico_slug']);
    $job['public_url'] = '/j/' . $job['public_token'];

    $b = $pdo->prepare('SELECT * FROM producao_briefings WHERE job_id = ?');
    $b->execute([$job['id']]);
    $brief = $b->fetch();
    if ($brief && !empty($brief['respostas'])) {
        $decoded = json_decode($brief['respostas'], true);
        $brief['respostas'] = is_array($decoded) ? $decoded : [];
    } elseif ($brief) {
        $brief['respostas'] = [];
    }
    $job['briefing'] = $brief ?: null;

    $e = $pdo->prepare('SELECT * FROM producao_entregas WHERE job_id = ? ORDER BY versao ASC, id ASC');
    $e->execute([$job['id']]);
    $job['entregas'] = $e->fetchAll();

    return $job;
}

function producaoGetJob(PDO $pdo, int $id): ?array
{
    $stmt = $pdo->prepare(producaoJobSql() . ' WHERE j.id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    return $row ? producaoHydrateJob($pdo, $row) : null;
}

function producaoGetJobByToken(PDO $pdo, string $token): ?array
{
    $stmt = $pdo->prepare(producaoJobSql() . ' WHERE j.public_token = ?');
    $stmt->execute([$token]);
    $row = $stmt->fetch();
    return $row ? producaoHydrateJob($pdo, $row) : null;
}

function producaoPodeVerJob(array $user, array $job, PDO $pdo): bool
{
    $perfil = $user['perfil'] ?? '';
    if (in_array($perfil, ['root', 'administrador'], true)) return true;
    $uid = (int)$user['id'];
    if ((int)$job['executor_id'] === $uid
        || (int)$job['atendente_id'] === $uid
        || (int)$job['created_by'] === $uid) {
        return true;
    }
    $exId = (int)($job['executante_id'] ?? 0);
    if ($exId < 1) return false;
    $st = $pdo->prepare('SELECT usuario_id FROM producao_executantes WHERE id = ?');
    $st->execute([$exId]);
    $row = $st->fetch();
    return $row && (int)$row['usuario_id'] === $uid;
}

function producaoDirUpload(): string
{
    $dir = __DIR__ . '/uploads/producao';
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    return $dir;
}
