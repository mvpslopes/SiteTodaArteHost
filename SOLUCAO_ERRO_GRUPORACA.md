# Solução para Erro de Sintaxe no Grupo Raça

## Problema

O arquivo JavaScript do Grupo Raça (`index-QUFP2xS-.js`) está apresentando um erro de sintaxe:

```
Uncaught SyntaxError: Unexpected token '}' (at index-QUFP2xS-.js:250:3302)
```

## Causa

O arquivo JavaScript foi gerado com erro durante o build do projeto do Grupo Raça. O arquivo fonte em `gruporaca/dist/assets/index-QUFP2xS-.js` já está corrompido, com chaves e parênteses desbalanceados.

## Solução

A única forma de corrigir este problema é **reconstruir o projeto do Grupo Raça**. 

⚠️ **IMPORTANTE**: A pasta `gruporaca` neste projeto contém apenas arquivos compilados (`dist`), não o código fonte. Você precisará do projeto fonte do Grupo Raça para reconstruir.

### Situação Atual

A estrutura atual é:
```
gruporaca/
└── dist/          # Apenas arquivos compilados (sem código fonte)
    └── assets/
        └── index-QUFP2xS-.js  (arquivo corrompido)
```

### Opções para Resolver

#### Opção 1: Se você tem o projeto fonte do Grupo Raça

1. Navegue até a pasta do projeto fonte do Grupo Raça (pode estar em outro local)

2. Instale as dependências (se necessário):
   ```bash
   npm install
   ```

3. Reconstrua o projeto:
   ```bash
   npm run build
   ```

4. Copie a pasta `dist` gerada para substituir `gruporaca/dist`:
   ```bash
   # No projeto do Grupo Raça, após o build
   # Copie a pasta dist para: C:\projetos\SiteTodaArteHost\gruporaca\dist
   ```

5. Volte para o projeto principal e copie os arquivos:
   ```bash
   cd C:\projetos\SiteTodaArteHost
   node scripts/copy-gruporaca.js
   ```

#### Opção 2: Usando o script automatizado (se o projeto fonte estiver em `gruporaca/`)

Se você colocar o projeto fonte do Grupo Raça na pasta `gruporaca/` (com `package.json`, `src/`, etc.), então pode usar:

```bash
npm run rebuild-gruporaca
```

Este script irá:
1. Instalar as dependências do projeto do Grupo Raça
2. Reconstruir o projeto (`npm run build`)
3. Copiar os arquivos para `public/gruporaca`

#### Opção 3: Se você não tem o projeto fonte

- Entre em contato com quem desenvolveu o projeto do Grupo Raça
- Solicite uma nova build do projeto ou o código fonte
- Verifique se há um repositório Git com o projeto

## Verificação

Após reconstruir, verifique se o erro foi resolvido:

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Acesse: `http://localhost:5173/gruporaca`

3. Abra o console do navegador (F12) e verifique se não há mais erros de sintaxe.

## Notas Importantes

- O script `copy-gruporaca.js` agora detecta e reporta problemas nos arquivos JavaScript, mas **não tenta corrigi-los automaticamente**, pois correções automáticas podem piorar o problema se o erro estiver no meio do arquivo.

- Se o problema persistir após reconstruir, verifique:
  - Se há erros no código fonte do projeto do Grupo Raça
  - Se todas as dependências estão instaladas corretamente
  - Se o build do projeto do Grupo Raça está sendo executado sem erros

## Estrutura Esperada

Certifique-se de que a estrutura de pastas está correta:

```
projeto/
├── gruporaca/          # Projeto do Grupo Raça
│   ├── package.json
│   ├── src/
│   └── dist/           # Build do Grupo Raça (gerado)
│       └── assets/
│           └── index-QUFP2xS-.js
├── public/
│   └── gruporaca/      # Arquivos copiados para o projeto principal
│       └── assets/
│           └── index-QUFP2xS-.js
└── scripts/
    ├── copy-gruporaca.js
    └── rebuild-gruporaca.js
```

