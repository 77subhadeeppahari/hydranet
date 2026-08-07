#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${APP_DIR:-/var/www/hydranet}"
DOMAIN="${1:-}"
REPO_URL="${REPO_URL:-}"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root: sudo bash deploy/lightsail/setup.sh your-domain.com"
  exit 1
fi
if [[ -z "${DOMAIN}" || "${DOMAIN}" == "localhost" ]]; then
  echo "Usage: sudo bash deploy/lightsail/setup.sh your-domain.com"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y nginx python3 python3-venv python3-pip build-essential curl ca-certificates git

if ! command -v node >/dev/null 2>&1 || [[ "$(node -p 'process.versions.node.split(\".\")[0]')" -lt 20 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
corepack enable || true
command -v yarn >/dev/null 2>&1 || npm install -g yarn

if [[ ! -d "${APP_DIR}/backend" || ! -d "${APP_DIR}/frontend" ]]; then
  if [[ -z "${REPO_URL}" ]]; then
    echo "Project not found at ${APP_DIR}. Clone it there first, or set REPO_URL."
    exit 1
  fi
  mkdir -p "$(dirname "${APP_DIR}")"
  git clone "${REPO_URL}" "${APP_DIR}"
fi

mkdir -p /etc/hydranet
if [[ ! -f /etc/hydranet/backend.env ]]; then
  install -m 600 "${APP_DIR}/deploy/lightsail/backend.env.example" /etc/hydranet/backend.env
  echo "Created /etc/hydranet/backend.env — edit its secrets before starting the backend."
fi

python3 -m venv "${APP_DIR}/.venv"
"${APP_DIR}/.venv/bin/pip" install --upgrade pip
"${APP_DIR}/.venv/bin/pip" install -r "${APP_DIR}/backend/requirements.txt"

cd "${APP_DIR}/frontend"
yarn install --frozen-lockfile
REACT_APP_BACKEND_URL="" yarn build

chown -R www-data:www-data "${APP_DIR}"
install -m 644 "${APP_DIR}/deploy/lightsail/hydranet-backend.service" /etc/systemd/system/hydranet-backend.service
sed "s/__DOMAIN__/${DOMAIN}/g" "${APP_DIR}/deploy/lightsail/nginx.conf.template" > /etc/nginx/sites-available/hydranet
ln -sfn /etc/nginx/sites-available/hydranet /etc/nginx/sites-enabled/hydranet
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl daemon-reload
systemctl enable hydranet-backend
systemctl restart hydranet-backend
systemctl enable nginx
systemctl restart nginx

echo
echo "Hydranet is installed."
echo "Backend: systemctl status hydranet-backend"
echo "Nginx:   systemctl status nginx"
echo "Logs:    journalctl -u hydranet-backend -f"
echo
echo "Next: edit /etc/hydranet/backend.env, then run:"
echo "  systemctl restart hydranet-backend"
echo "  certbot --nginx -d ${DOMAIN}"