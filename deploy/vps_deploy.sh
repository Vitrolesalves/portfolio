#!/bin/bash
# ============================================================
#  Deploy do portfólio na VPS — SUBSTITUI o site de cheats
#  reaproveitando o domínio, SEM tocar no bot do Discord.
#
#  Uso:
#     bash vps_deploy.sh git@github.com:Vitrolesalves/<REPO>.git
#     # ou com token:
#     bash vps_deploy.sh https://<TOKEN>@github.com/Vitrolesalves/<REPO>.git
#
#  Estratégia segura:
#   - O bot vive em /opt/botdc e roda como serviço próprio -> NÃO é tocado.
#   - O nginx server block de vitrolesalves.com (que contém as rotas de
#     webhook/loja do bot) NÃO é reescrito. Só troca-se o CONTEÚDO do
#     web root. As rotas do bot continuam idênticas.
# ============================================================
set -euo pipefail

REPO_URL="${1:-}"
DOMAIN="vitrolesalves.com"
ROOT="/var/www/${DOMAIN}/html"
TS="$(date +%Y%m%d-%H%M%S)"

if [ -z "$REPO_URL" ]; then
  echo "ERRO: passe a URL do repositório. Ex:"
  echo "  bash vps_deploy.sh git@github.com:Vitrolesalves/<REPO>.git"
  exit 1
fi

echo "=============================================="
echo "  Deploy portfólio -> ${DOMAIN}"
echo "=============================================="

# --- 0. Checagem de segurança: mostrar o bot (e NÃO mexer nele) ---
echo "[check] Serviços do bot (NÃO serão tocados):"
systemctl list-units --type=service --state=running 2>/dev/null | grep -iE "bot" || echo "  (nenhum serviço 'bot' pelo nome — confira manualmente com: systemctl list-units | grep -i bot)"
echo "[check] Pasta do bot:"; ls -d /opt/botdc 2>/dev/null && echo "  /opt/botdc preservado." || echo "  /opt/botdc não encontrado (ok se o bot estiver em outro lugar)."
echo

# --- 1. Backup do site atual (cheats) ---
if [ -d "$ROOT" ]; then
  echo "[1/5] Backup do site atual em ${ROOT}.bak-${TS}"
  mv "$ROOT" "${ROOT}.bak-${TS}"
else
  echo "[1/5] Web root não existia; criando limpo."
fi
mkdir -p "$(dirname "$ROOT")"

# --- 2. Clona o portfólio no web root (vira o site principal) ---
echo "[2/5] Clonando portfólio em ${ROOT}"
git clone --depth 1 "$REPO_URL" "$ROOT"

# --- 3. Testa a config do nginx (inalterada) ---
echo "[3/5] Testando nginx..."
nginx -t

# --- 4. Reload (não restart) — zero downtime, bot intacto ---
echo "[4/5] Recarregando nginx..."
systemctl reload nginx

# --- 5. Verificação ---
echo "[5/5] Verificando resposta pelo domínio..."
code="$(curl -s -o /dev/null -w '%{http_code}' -H "Host: ${DOMAIN}" http://localhost/ || true)"
echo "  HTTP ${code} para ${DOMAIN}"
echo
echo "=============================================="
echo "  Pronto! Portfólio no ar em ${DOMAIN}"
echo "  Backup do site antigo: ${ROOT}.bak-${TS}"
echo "  Atualizar no futuro:   cd ${ROOT} && git pull"
echo "  Remover o backup só depois de conferir tudo:"
echo "     rm -rf ${ROOT}.bak-${TS}"
echo "=============================================="
