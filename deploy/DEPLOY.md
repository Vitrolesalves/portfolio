# Deploy — vitrolesalves.com

O portfólio está **em produção** em https://vitrolesalves.com, servido pelo Nginx na VPS
(Ubuntu). O deploy é por **git pull + sync**, com o repositório clonado fora do web root.

## Arquitetura na VPS

```
GitHub (privado)  Vitrolesalves/portfolio
        │  git pull (deploy key read-only: /root/.ssh/portfolio_deploy)
        ▼
/opt/portfolio-src        ← clone completo do repo (fica FORA do web root)
        │  rsync (só index.html + assets/)
        ▼
/var/www/vitrolesalves.com/app   ← web root do Nginx (sem .git, sem docs)
```

Por que o clone fica fora do web root: se o `.git` estivesse dentro do diretório servido,
qualquer pessoa poderia baixar o histórico em `/.git/`. Aqui o web root recebe só os
arquivos servíveis — `/.git/` e `/deploy/` retornam 404.

## O que NÃO é tocado

- **Bot do Discord** — `botdc-marretaspop.service` em `/opt/botdc`. Intacto.
- **Config do Nginx** — `/etc/nginx/sites-enabled/vitrolesalves.com` (contém as rotas
  `/api/` e `/marretaspop/` do bot). Não é reescrito; só troca-se o conteúdo do web root.

## Atualizar o site

```bash
# 1) na sua máquina
git add -A && git commit -m "..." && git push

# 2) na VPS
ssh root@vitrolesalves.com
bash /root/deploy-portfolio.sh
```

O script [`deploy-portfolio.sh`](deploy-portfolio.sh) (cópia versionada do que roda em
`/root/deploy-portfolio.sh`) faz `git pull` em `/opt/portfolio-src` e sincroniza para o
web root, ajustando dono e permissões.

## Rodar localmente

```bash
python -m http.server 5577   # http://127.0.0.1:5577
```

## Histórico / rollback

- O site anterior (cheats) foi preservado em `/var/www/vitrolesalves.com/app.cheats-bak-<timestamp>`.
- Backend antigo `genesis-api.service`: parado e desabilitado (reversível com
  `systemctl enable --now genesis-api.service`).
