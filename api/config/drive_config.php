<?php
/**
 * Configuração Google Drive - Grupo Raça
 * 
 * IMPORTANTE: Este arquivo contém configurações sensíveis.
 * NUNCA compartilhe publicamente ou faça commit no Git.
 */

return [
    // Caminho para o arquivo de credenciais JSON
    'credentials_path' => __DIR__ . '/grupo-raca-drive-credentials.json',
    
    // ID da pasta raiz no Google Drive
    'root_folder_id' => '1EeKxOPybc3QRtVS6RgOUY0TEirl4MBsD',
    
    // Escopos necessários para acessar o Google Drive
    'scopes' => [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file'
    ],
    
    // Configurações de upload
    'upload' => [
        'max_file_size' => 100 * 1024 * 1024, // 100MB
        'allowed_types' => [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'video/mp4',
            'video/quicktime',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.openxmlformats-officedocument.presentationml.presentation' // .pptx
        ]
    ],
    
    // Mapeamento de pastas por usuário (será usado pelo sistema)
    'folder_mapping' => [
        // ROOT e ADMIN têm acesso a todas as pastas (*)
        // USER têm acesso apenas à sua pasta específica
        // Exemplo:
        // 'fotografo@gruporaca.com.br' => 'fotografos',
        // 'deolhonomarchador@gruporaca.com.br' => 'midias/de-olho-no-marchador',
    ]
];
?>

