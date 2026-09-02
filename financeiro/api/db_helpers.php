<?php
/**
 * Helpers para compatibilidade quando tabela clientes / coluna cliente_id ainda não existem
 */
function tableExists(PDO $pdo, string $table): bool {
    try {
        $stmt = $pdo->query("SHOW TABLES LIKE " . $pdo->quote($table));
        return $stmt && $stmt->rowCount() > 0;
    } catch (Throwable $e) {
        return false;
    }
}

function columnExists(PDO $pdo, string $table, string $column): bool {
    try {
        $stmt = $pdo->query("SHOW COLUMNS FROM `" . str_replace('`', '``', $table) . "` LIKE " . $pdo->quote($column));
        return $stmt && $stmt->rowCount() > 0;
    } catch (Throwable $e) {
        return false;
    }
}

function ensureChecklistResponsavelColumn(PDO $pdo): bool {
    if (!tableExists($pdo, 'checklist_tarefas_fixas')) {
        return false;
    }
    if (columnExists($pdo, 'checklist_tarefas_fixas', 'responsavel_id')) {
        return true;
    }
    try {
        $pdo->exec("ALTER TABLE checklist_tarefas_fixas ADD COLUMN responsavel_id INT UNSIGNED DEFAULT NULL");
        try {
            $pdo->exec("ALTER TABLE checklist_tarefas_fixas ADD INDEX idx_checklist_responsavel (responsavel_id)");
        } catch (Throwable $e) {
        }
        try {
            $pdo->exec("
                ALTER TABLE checklist_tarefas_fixas
                ADD CONSTRAINT fk_checklist_responsavel
                FOREIGN KEY (responsavel_id) REFERENCES usuarios(id)
                ON DELETE SET NULL ON UPDATE CASCADE
            ");
        } catch (Throwable $e) {
        }
        return true;
    } catch (Throwable $e) {
        return columnExists($pdo, 'checklist_tarefas_fixas', 'responsavel_id');
    }
}

function ensureChecklistMensalSupport(PDO $pdo): bool {
    if (!tableExists($pdo, 'checklist_tarefas_fixas')) {
        return false;
    }
    try {
        $pdo->exec("
            ALTER TABLE checklist_tarefas_fixas
            MODIFY COLUMN periodicidade ENUM('diaria','segunda','terca','quarta','quinta','sexta','mensal') NOT NULL DEFAULT 'diaria'
        ");
    } catch (Throwable $e) {
    }
    if (columnExists($pdo, 'checklist_tarefas_fixas', 'dia_mes')) {
        return true;
    }
    try {
        $pdo->exec("ALTER TABLE checklist_tarefas_fixas ADD COLUMN dia_mes TINYINT UNSIGNED DEFAULT NULL");
        return true;
    } catch (Throwable $e) {
        return columnExists($pdo, 'checklist_tarefas_fixas', 'dia_mes');
    }
}

function ensureUsuarioPerfilFreelancer(PDO $pdo): void {
    static $done = false;
    if ($done) {
        return;
    }
    if (!tableExists($pdo, 'usuarios')) {
        return;
    }
    try {
        $stmt = $pdo->query("SHOW COLUMNS FROM usuarios LIKE 'perfil'");
        $col = $stmt ? $stmt->fetch() : null;
        $type = strtolower((string)($col['Type'] ?? ''));
        if (strpos($type, "'freelancer'") !== false) {
            $done = true;
            return;
        }
        $pdo->exec("ALTER TABLE usuarios MODIFY COLUMN perfil ENUM('root','administrador','usuario','cliente','freelancer') NOT NULL DEFAULT 'usuario'");
    } catch (Throwable $e) {
    }
    $done = true;
}

function ensureUsuarioPasswordEncColumn(PDO $pdo): bool {
    if (!tableExists($pdo, 'usuarios')) {
        return false;
    }
    if (columnExists($pdo, 'usuarios', 'password_enc')) {
        return true;
    }
    try {
        $pdo->exec("ALTER TABLE usuarios ADD COLUMN password_enc TEXT DEFAULT NULL");
        return true;
    } catch (Throwable $e) {
        return columnExists($pdo, 'usuarios', 'password_enc');
    }
}

function passwordDisplayKey(): string {
    return hash('sha256', 'todaarte-gestao-pwd-display|' . (defined('DB_PASS') ? DB_PASS : ''), true);
}

function encryptPasswordDisplay(string $plain): string {
    $iv = random_bytes(16);
    $raw = openssl_encrypt($plain, 'AES-256-CBC', passwordDisplayKey(), OPENSSL_RAW_DATA, $iv);
    return base64_encode($iv . $raw);
}

function decryptPasswordDisplay(?string $enc): ?string {
    if ($enc === null || $enc === '') {
        return null;
    }
    $bin = base64_decode($enc, true);
    if ($bin === false || strlen($bin) < 17) {
        return null;
    }
    $plain = openssl_decrypt(substr($bin, 16), 'AES-256-CBC', passwordDisplayKey(), OPENSSL_RAW_DATA, substr($bin, 0, 16));
    return $plain === false ? null : $plain;
}

/** Inclui senha visível na API, exceto operador e freelancer. */
function attachUsuarioSenhaVisivel(array $row): array {
    $enc = $row['password_enc'] ?? null;
    unset($row['password_enc']);
    if (in_array($row['perfil'] ?? '', ['usuario', 'freelancer'], true)) {
        $row['senha'] = null;
        return $row;
    }
    $row['senha'] = decryptPasswordDisplay(is_string($enc) ? $enc : null);
    return $row;
}

function ensureClienteAcessosTable(PDO $pdo): void {
    static $done = false;
    if ($done) {
        return;
    }
    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS cliente_acessos (
              id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
              cliente_id INT UNSIGNED NOT NULL,
              plataforma VARCHAR(80) NOT NULL,
              rotulo VARCHAR(80) DEFAULT NULL,
              login VARCHAR(255) NOT NULL DEFAULT '',
              senha_enc TEXT DEFAULT NULL,
              observacao VARCHAR(500) DEFAULT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              UNIQUE KEY uniq_cliente_plataforma (cliente_id, plataforma),
              INDEX idx_cliente_acesso_cliente (cliente_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    } catch (Throwable $e) {
    }
    if (tableExists($pdo, 'cliente_acessos')) {
        try {
            $stmt = $pdo->query("SHOW COLUMNS FROM cliente_acessos LIKE 'plataforma'");
            $col = $stmt ? $stmt->fetch() : null;
            $type = strtolower((string)($col['Type'] ?? ''));
            if (strpos($type, 'enum') !== false || strpos($type, 'varchar(80)') === false) {
                $pdo->exec("ALTER TABLE cliente_acessos MODIFY COLUMN plataforma VARCHAR(80) NOT NULL");
            }
        } catch (Throwable $e) {
        }
        if (!columnExists($pdo, 'cliente_acessos', 'rotulo')) {
            try {
                $pdo->exec("ALTER TABLE cliente_acessos ADD COLUMN rotulo VARCHAR(80) DEFAULT NULL AFTER plataforma");
            } catch (Throwable $e) {
            }
        }
    }
    $done = true;
}

function ensureTransacaoGastoFixoColumn(PDO $pdo): bool {
    if (!tableExists($pdo, 'transacoes')) {
        return false;
    }
    if (columnExists($pdo, 'transacoes', 'gasto_fixo_id')) {
        return true;
    }
    try {
        $pdo->exec("ALTER TABLE transacoes ADD COLUMN gasto_fixo_id INT UNSIGNED DEFAULT NULL");
        try {
            $pdo->exec("ALTER TABLE transacoes ADD INDEX idx_transacoes_gasto_fixo (gasto_fixo_id)");
        } catch (Throwable $e) {
        }
        try {
            $pdo->exec("
                ALTER TABLE transacoes
                ADD CONSTRAINT fk_transacoes_gasto_fixo
                FOREIGN KEY (gasto_fixo_id) REFERENCES gastos_fixos(id)
                ON DELETE SET NULL ON UPDATE CASCADE
            ");
        } catch (Throwable $e) {
        }
        return true;
    } catch (Throwable $e) {
        return columnExists($pdo, 'transacoes', 'gasto_fixo_id');
    }
}

function checklistDiaMesValido($valor): ?int {
    $n = (int)$valor;
    if ($n < 1 || $n > 31) {
        return null;
    }
    return $n;
}

/** Dia 31 em fevereiro cai no último dia do mês. */
function checklistMensalCaiNoDia(int $diaMes, int $diaAtual, int $ultimoDiaMes): bool {
    if ($diaMes === $diaAtual) {
        return true;
    }
    return $diaMes > $ultimoDiaMes && $diaAtual === $ultimoDiaMes;
}

function ensureCatalogoServicosTables(PDO $pdo): void {
    static $done = false;
    if ($done) return;
    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS catalogo_servicos (
              id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
              slug VARCHAR(100) DEFAULT NULL,
              nome VARCHAR(255) NOT NULL,
              categoria VARCHAR(120) NOT NULL DEFAULT 'Geral',
              descricao TEXT DEFAULT NULL,
              detalhes TEXT DEFAULT NULL,
              tipo_preco ENUM('fixo','unitario','personalizado') NOT NULL DEFAULT 'fixo',
              valor DECIMAL(15,2) DEFAULT NULL,
              unidade VARCHAR(40) DEFAULT NULL,
              ativo TINYINT(1) NOT NULL DEFAULT 1,
              ordem INT NOT NULL DEFAULT 0,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              UNIQUE KEY uniq_catalogo_slug (slug),
              INDEX idx_catalogo_categoria (categoria),
              INDEX idx_catalogo_ativo (ativo)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS orcamentos (
              id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
              numero INT UNSIGNED NOT NULL,
              cliente_id INT UNSIGNED DEFAULT NULL,
              cliente_nome VARCHAR(255) NOT NULL DEFAULT '',
              titulo VARCHAR(255) NOT NULL DEFAULT 'Orçamento',
              status ENUM('rascunho','enviado','aprovado','recusado') NOT NULL DEFAULT 'rascunho',
              prazo VARCHAR(255) DEFAULT NULL,
              observacoes TEXT DEFAULT NULL,
              validade_ate DATE DEFAULT NULL,
              total DECIMAL(15,2) NOT NULL DEFAULT 0,
              created_by INT UNSIGNED DEFAULT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              UNIQUE KEY uniq_orcamento_numero (numero),
              INDEX idx_orcamento_cliente (cliente_id),
              INDEX idx_orcamento_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS orcamento_itens (
              id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
              orcamento_id INT UNSIGNED NOT NULL,
              servico_id INT UNSIGNED DEFAULT NULL,
              descricao VARCHAR(500) NOT NULL,
              detalhes TEXT DEFAULT NULL,
              quantidade DECIMAL(12,2) NOT NULL DEFAULT 1,
              valor_unitario DECIMAL(15,2) NOT NULL DEFAULT 0,
              valor_total DECIMAL(15,2) NOT NULL DEFAULT 0,
              prazo VARCHAR(255) DEFAULT NULL,
              observacao VARCHAR(500) DEFAULT NULL,
              ordem INT NOT NULL DEFAULT 0,
              INDEX idx_orcamento_item_orc (orcamento_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
        $count = (int)$pdo->query('SELECT COUNT(*) FROM catalogo_servicos')->fetchColumn();
        if ($count === 0) {
            seedCatalogoServicosPadrao($pdo);
        }
    } catch (Throwable $e) {
    }
    $done = true;
}

function seedCatalogoServicosPadrao(PDO $pdo): void {
    $itens = [
        ['logo', 'Criação de logotipo', 'Identidade visual', 'Logotipo simples', null, 'fixo', 329.00, null, 10],
        ['logo_variacoes', 'Logotipo e variações', 'Identidade visual', 'Logotipo com variações', null, 'fixo', 429.00, null, 20],
        ['identidade', 'ID Visual completa', 'Identidade visual', 'Pacote completo de identidade visual', "Contém:\nHistória do logo\nLogo principal\nMarca d'água\nSubmarca\nVariação de Logotipo\nPosicionamento\nLembretes\nPaleta de cores\nTipografia\nCartão de Visita\nPattern\nDestaques\n3 Templates FEED\n3 Template STORIES\nAssinatura de e-mail\nLand Page (1 página)\nQR-CODE\nMockup", 'fixo', 1799.00, null, 30],
        ['gestao_redes', 'Gestão de redes sociais', 'Gestão', 'Orçamento personalizado conforme escopo do cliente', null, 'personalizado', null, null, 40],
        ['sites', 'Desenvolvimento de sites', 'Sites', 'Orçamento personalizado conforme escopo do projeto', null, 'personalizado', null, null, 50],
        ['ig_12_cliente', 'Pacote Instagram 12 materiais (conteúdo do cliente)', 'Pacotes Instagram', '12 materiais com conteúdo enviado pelo cliente', null, 'fixo', 659.00, 'pacote', 60],
        ['ig_24_cliente', 'Pacote Instagram 24 materiais (conteúdo do cliente)', 'Pacotes Instagram', '24 materiais com conteúdo enviado pelo cliente', null, 'fixo', 1199.00, 'pacote', 70],
        ['ig_12_todaarte', 'Pacote Instagram 12 materiais (criação Toda Arte)', 'Pacotes Instagram', '12 materiais com ideias, chamadas, textos e direcionamento pela Toda Arte', null, 'fixo', 899.00, 'pacote', 80],
        ['ig_24_todaarte', 'Pacote Instagram 24 materiais (criação Toda Arte)', 'Pacotes Instagram', '24 materiais com ideias, chamadas, textos e direcionamento pela Toda Arte', null, 'fixo', 1699.00, 'pacote', 90],
        ['catalogos', 'Produção de catálogos e apresentações', 'Catálogos e apresentações', 'Catálogos personalizados e exclusivos para apresentação comercial, cardápios, etc.', null, 'unitario', 69.90, 'página', 100],
        ['cartao_digital', 'Cartão digital', 'Cartão digital', 'Cartão de visita digital e interativo com links direcionáveis + QR-CODE', null, 'fixo', 199.00, null, 110],
        ['catalogo_leiloes', 'Catálogo completo de leilões', 'Catálogo de leilões', 'Catálogo completo', null, 'fixo', 1700.00, null, 120],
        ['arte_avulsa', 'Artes digitais avulsas', 'Outros serviços', null, null, 'fixo', 59.90, 'cada', 130],
        ['arte_feed_stories', 'Artes digitais avulsas (FEED + STORIES)', 'Outros serviços', null, null, 'fixo', 89.90, 'cada', 140],
        ['qrcode', 'Criação de QR-CODE', 'Outros serviços', null, null, 'fixo', 59.00, null, 150],
        ['stories_animado', 'Stories animado', 'Outros serviços', null, null, 'fixo', 79.00, null, 160],
        ['video_30s', 'Edição de vídeo simples (até 30 segundos)', 'Outros serviços', null, null, 'fixo', 129.00, null, 170],
        ['video_60s', 'Edição de vídeo (até 60 segundos)', 'Outros serviços', null, null, 'fixo', 219.00, null, 180],
        ['video_3min', 'Edição de vídeo (até 3 minutos)', 'Outros serviços', null, null, 'fixo', 529.00, null, 190],
        ['adicional_ia', 'Adicional de IA', 'Outros serviços', null, null, 'fixo', 39.90, null, 200],
        ['adicional_estrategia', 'Adicional de criação de estratégia/conteúdo', 'Outros serviços', null, null, 'fixo', 39.90, null, 210],
        ['adicional_pesquisa', 'Adicional de pesquisa de material', 'Outros serviços', null, null, 'fixo', 39.90, null, 220],
        ['figurinhas', 'Figurinhas personalizadas', 'Outros serviços', null, null, 'fixo', 19.90, null, 230],
        ['assinatura_email', 'Assinatura de e-mail', 'Outros serviços', null, null, 'fixo', 39.90, null, 240],
        ['ensaio_fotos', 'Ensaio de fotos profissionais (15 fotos)', 'Outros serviços', null, null, 'fixo', 380.00, null, 250],
        ['audiovisual_diaria', 'Produção audiovisual (diária)', 'Outros serviços', 'Produção audiovisual + km/rodado (R$ 2,00) + hospedagem + alimentação', null, 'unitario', 650.00, 'diária', 260],
        ['analise_perfil', 'Análise de perfil', 'Outros serviços', null, null, 'fixo', 99.00, null, 270],
        ['personalizacao_perfil', 'Personalização de perfil', 'Outros serviços', null, null, 'fixo', 499.00, null, 280],
        ['plotagem_carro', 'Arte Plotagem (carro)', 'Outros serviços', null, null, 'fixo', 1500.00, null, 290],
        ['plotagem_caminhao', 'Arte Plotagem (caminhão)', 'Outros serviços', null, null, 'fixo', 2500.00, null, 300],
        ['mockup', 'Mockup', 'Outros serviços', null, null, 'unitario', 300.00, 'cada', 310],
        ['conteudo_feed_estrategia', 'Elaboração de conteúdo feed (estratégia, organização e calendário)', 'Mídias digitais (sem gestão)', 'Artes extras', null, 'unitario', 39.90, 'cada', 320],
        ['cronograma_stories', 'Cronograma de stories', 'Mídias digitais (sem gestão)', 'Artes extras', null, 'unitario', 29.90, 'dia', 330],
        ['conteudo_reels', 'Elaboração de estratégia/conteúdo post de reels', 'Mídias digitais (sem gestão)', 'Artes extras', null, 'unitario', 59.90, 'cada', 340],
        ['post_feed_estatico', 'Elaboração de post feed em arte estática', 'Mídias digitais (sem gestão)', 'Artes extras', null, 'unitario', 59.90, 'cada', 350],
        ['post_feed_carrossel', 'Elaboração de post feed em carrossel (até 10 pag)', 'Mídias digitais (sem gestão)', 'Artes extras', null, 'unitario', 99.90, 'cada', 360],
    ];
    $stmt = $pdo->prepare('INSERT IGNORE INTO catalogo_servicos (slug, nome, categoria, descricao, detalhes, tipo_preco, valor, unidade, ordem) VALUES (?,?,?,?,?,?,?,?,?)');
    foreach ($itens as $row) {
        $stmt->execute($row);
    }
}
