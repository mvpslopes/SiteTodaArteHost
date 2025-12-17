# 📤 Instruções para Upload das Credenciais

## ✅ O que você já tem:

1. ✅ Arquivo JSON de credenciais: `tidal-triumph-481417-g3-60d43e0c13d3.json`
2. ✅ ID da pasta raiz: `1EeKxOPybc3QRtVS6RgOUY0TEirl4MBsD`
3. ✅ Email da Service Account: `grupo-raca-drive-service@tidal-triumph-481417-g3.iam.gserviceaccount.com`

## 📋 Próximos Passos:

### 1. Renomear o arquivo JSON (Recomendado)

Renomeie o arquivo baixado para:
```
grupo-raca-drive-credentials.json
```

### 2. Verificar se compartilhou a pasta no Google Drive

1. Acesse: https://drive.google.com/drive/folders/1EeKxOPybc3QRtVS6RgOUY0TEirl4MBsD
2. Clique com botão direito na pasta `GRUPO_RACA`
3. Clique em **"Compartilhar"**
4. Verifique se o email `grupo-raca-drive-service@tidal-triumph-481417-g3.iam.gserviceaccount.com` está na lista
5. Se não estiver, adicione com permissão **"Editor"**

### 3. Fazer Upload para o Servidor Hostinger

#### Opção A: Via File Manager (cPanel)

1. Acesse o **File Manager** do cPanel da Hostinger
2. Navegue até: `/public_html/api/config/`
   - Se a pasta `config` não existir, crie ela
3. Faça upload do arquivo `grupo-raca-drive-credentials.json`
4. Faça upload do arquivo `drive_config.php` (já criado no projeto)

#### Opção B: Via FTP

1. Conecte-se ao servidor via FTP
2. Navegue até: `/public_html/api/config/`
3. Faça upload dos dois arquivos:
   - `grupo-raca-drive-credentials.json`
   - `drive_config.php`

### 4. Configurar Permissões (Importante!)

Após o upload, configure as permissões do arquivo JSON:

**Via File Manager:**
1. Clique com botão direito no arquivo `grupo-raca-drive-credentials.json`
2. Selecione **"Alterar Permissões"** ou **"Change Permissions"**
3. Defina como: `600` (apenas leitura/escrita para o dono)
   - Ou marque: `rw-------` (Read/Write para Owner, nada para outros)

**Via Terminal/SSH (se tiver acesso):**
```bash
cd /home/usuario/public_html/api/config/
chmod 600 grupo-raca-drive-credentials.json
```

### 5. Verificar Estrutura de Pastas

Certifique-se de que criou todas as pastas no Google Drive:

```
GRUPO_RACA/ (ID: 1EeKxOPybc3QRtVS6RgOUY0TEirl4MBsD)
├── marketing/
├── fotografos/
├── catalogos/
└── midias/
    ├── de-olho-no-marchador/
    ├── top-marchador/
    ├── aqui-tem-raca/
    ├── raca-e-marcha/
    ├── portal-marchador/
    └── pura-marcha/
```

## ⚠️ Segurança

- **NUNCA** compartilhe o arquivo JSON publicamente
- **NUNCA** faça commit do arquivo JSON no Git
- Mantenha as permissões restritas (`600`)
- Se o arquivo for comprometido, delete a Service Account e crie uma nova

## ✅ Checklist Final

- [ ] Arquivo JSON renomeado para `grupo-raca-drive-credentials.json`
- [ ] Pasta `GRUPO_RACA` compartilhada com Service Account (permissão Editor)
- [ ] Arquivo JSON enviado para `/api/config/` no servidor
- [ ] Arquivo `drive_config.php` enviado para `/api/config/` no servidor
- [ ] Permissões do arquivo JSON configuradas como `600`
- [ ] Todas as pastas criadas no Google Drive

## 🚀 Próximo Passo

Após completar o checklist, me avise para eu implementar a classe `DriveService` em PHP e integrar com o sistema!

---

**Última atualização**: Dezembro 2024

