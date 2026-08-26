# Rodando a automação localmente

O ambiente sandbox remoto teve o IP bloqueado pelo WAF da XP, então a automação
precisa rodar na sua máquina (mesmo IP que você já usa pra acessar o hub).

## Pré-requisitos

1. Node.js 18+ instalado.
2. Este repositório clonado, na branch `claude/loving-ritchie-yesh4i`:
   ```bash
   git clone <url-do-repo>
   cd automacao_hub
   git checkout claude/loving-ritchie-yesh4i
   ```
3. Instalar dependências e o Chromium do Playwright:
   ```bash
   cd automation
   npm install
   npx playwright install chromium
   ```
4. Definir as credenciais como variáveis de ambiente (não commitar em lugar nenhum):
   ```bash
   export XPI_LOGIN="seu_login"
   export XPI_SENHA="sua_senha"
   ```

## Como rodar

Abra o Claude Code (CLI ou desktop) nesta pasta do repositório e continue a
automação a partir daqui — os scripts de cada etapa (`step_login.js`, e os
próximos que vamos escrever para MFA/navegação/export) ficam na pasta
`automation/`. Quando o script chegar na tela de MFA, o Claude vai te
perguntar o código diretamente no chat.

Para ver o navegador abrindo na tela (útil para debugar), rode com:
```bash
HEADFUL=1 node step_login.js
```
