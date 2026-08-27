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
