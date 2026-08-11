#!/usr/bin/env bash
set -Eeuo pipefail

# Provider-neutral installer for Ubuntu/Debian VPS servers.
# Usage:
#   sudo bash deploy/vps/setup.sh example.com
#   sudo APP_DIR=/srv/hydranet bash deploy/vps/setup.sh example.com
#   sudo REPO_URL=https://github.com/OWNER/REPO.git bash deploy/vps/setup.sh example.com

APP_DIR="${APP_DIR:-/var/www/hydranet}"
DOMAIN="${1:-}"
REPO_URL="${REPO_URL:-}"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root: sudo bash deploy/vps/setup.sh your-domain.com"
  exit 1
fi

if [[ -z "${DOMAIN}" || "${DOMAIN}" == "localhost" ]]; then
  echo "Usage: sudo bash deploy/vps/setup.sh your-domain.com"
  echo "Use the VPS public IP as the domain value if DNS is not configured yet."
  exit 1
fi

if [[ ! -f /etc/os-release ]]; then
  echo "Cannot identify the operating system."
  exit 1
fi
# shellcheck disable=SC1091
source /etc/os-release
if [[ "${ID:-}" != "ubuntu" && "${ID:-}" != "debian" && "${ID_LIKE:-}" != *debian* ]]; then
  echo "This installer supports Ubuntu and Debian VPS servers."
  echo "For another distribution, use the deployment files as templates."
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y nginx python3 python3-venv python3-pip build-essential curl ca-certificates git

if ! command -v node >/dev/null 2>&1 || [[ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

corepack enable >/dev/null 2>&1 || true
if ! command -v yarn >/dev/null 2>&1; then
  npm install -g yarn
fi

if [[ ! -d "${APP_DIR}/backend" || ! -d "${APP_DIR}/frontend" ]]; then
  if [[ -z "${REPO_URL}" ]]; then
    echo "Project not found at ${APP_DIR}. Clone it there first, or set REPO_URL."
    exit 1
  fi
  mkdir -p "$(dirname -- "${APP_DIR}")"
  git clone "${REPO_URL}" "${APP_DIR}"
fi

if [[ ! -f "${APP_DIR}/deploy/vps/backend.env.example" ]]; then
  echo "Expected deployment files were not found under ${APP_DIR}."
  exit 1
fi

mkdir -p /etc/hydranet
if [[ ! -f /etc/hydranet/backend.env ]]; then
  install -m 600 "${APP_DIR}/deploy/vps/backend.env.example" /etc/hydranet/backend.env
  echo "Created /etc/hydranet/backend.env — edit its secrets before relying on the backend."
fi

python3 -m venv "${APP_DIR}/.venv"
"${APP_DIR}/.venv/bin/pip" install --upgrade pip
"${APP_DIR}/.venv/bin/pip" install -r "${APP_DIR}/backend/requirements.txt"

cd "${APP_DIR}/frontend"
# Replit-generated lockfiles can contain internal package-firewall URLs that
# are unreachable from an external VPS. Normalize them to the public registry.
if [[ -f yarn.lock ]]; then
  sed -i \
    -e 's#http://package-firewall\.replit\.local/npm/#https://registry.npmjs.org/#g' \
    -e 's#https://package-firewall\.replit\.local/npm/#https://registry.npmjs.org/#g' \
    yarn.lock
fi
yarn config set registry https://registry.npmjs.org/ >/dev/null
yarn install --frozen-lockfile
REACT_APP_BACKEND_URL="" yarn build

chown -R www-data:www-data "${APP_DIR}"
install -m 644 "${APP_DIR}/deploy/vps/hydranet-backend.service.template" /etc/systemd/system/hydranet-backend.service
sed -i "s|__APP_DIR__|${APP_DIR}|g" /etc/systemd/system/hydranet-backend.service
sed "s|__DOMAIN__|${DOMAIN}|g; s|__APP_DIR__|${APP_DIR}|g" \
  "${APP_DIR}/deploy/vps/nginx.conf.template" > /etc/nginx/sites-available/hydranet
ln -sfn /etc/nginx/sites-available/hydranet /etc/nginx/sites-enabled/hydranet
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl daemon-reload
systemctl enable hydranet-backend
systemctl restart hydranet-backend
systemctl enable nginx
systemctl restart nginx

echo
echo "Hydranet is installed on this VPS."
echo "Site:    http://${DOMAIN}"
echo "Backend: systemctl status hydranet-backend"
echo "Nginx:   systemctl status nginx"
echo "Logs:    journalctl -u hydranet-backend -f"
echo
echo "Next:"
echo "  1. Edit /etc/hydranet/backend.env with production values."
echo "  2. Run: systemctl restart hydranet-backend"
echo "  3. After DNS resolves, install Certbot and run:"
echo "     apt-get install -y certbot python3-certbot-nginx"
echo "     certbot --nginx -d ${DOMAIN}"