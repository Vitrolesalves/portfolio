#!/bin/bash
# ============================================================
#  Deploy do portfólio na VPS (git pull + sync)
#  Localização na VPS: /root/deploy-portfolio.sh
#
#  Arquitetura (segura):
#   - O repositório privado é clonado em /opt/portfolio-src (FORA do web root),
#     então o .git NUNCA fica exposto publicamente.
#   - Só os arquivos servíveis (index.html + assets/) são sincronizados para
#     o web root /var/www/vitrolesalves.com/app.
#   - O nginx e o bot (/opt/botdc, botdc-*.service) não são tocados.
#
#  Autenticação: deploy key read-only em /root/.ssh/portfolio_deploy.
#
#  Fluxo de atualização:
#     (local)  editar -> git commit -> git push
#     (VPS)    bash /root/deploy-portfolio.sh
# ============================================================
set -e
SRC=/opt/portfolio-src
WEBROOT=/var/www/vitrolesalves.com/app
export GIT_SSH_COMMAND='ssh -i /root/.ssh/portfolio_deploy -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new'

echo "[deploy] git pull..."
git -C "$SRC" pull --ff-only

echo "[deploy] sincronizando para o web root..."
mkdir -p "$WEBROOT"
rsync -a --delete "$SRC/assets/" "$WEBROOT/assets/"
cp -f "$SRC/index.html" "$WEBROOT/index.html"

chown -R root:root "$WEBROOT"
find "$WEBROOT" -type d -exec chmod 755 {} \;
find "$WEBROOT" -type f -exec chmod 644 {} \;

echo "[deploy] OK $(date '+%F %T')"
