# Deploy Hydranet to any Ubuntu/Debian VPS

This provider-neutral deployment uses a standard Linux VPS with:

- **Nginx** serving the React production build from `frontend/build`
- **FastAPI + Uvicorn** managed by systemd on `127.0.0.1:8000`
- **MongoDB Atlas** through the `MONGO_URL` environment variable
- **Same-origin `/api` requests** from the React app
- **Certbot/Nginx** for optional HTTPS

It works with VPS providers such as DigitalOcean, Hetzner, Vultr, Linode,
Contabo, OVH, AWS EC2, Lightsail, or a self-managed Ubuntu/Debian server.

## Requirements

Create an Ubuntu 22.04/24.04 or Debian 12 VPS and allow these inbound ports in
the provider firewall and the server firewall:

- TCP 22 for SSH
- TCP 80 for HTTP and certificate issuance
- TCP 443 for HTTPS

Point the domain's DNS A record to the VPS public IP. You can initially use the
public IP as the installer domain value, but HTTPS requires a domain name.

## Install from an existing checkout

```bash
sudo mkdir -p /var/www
sudo git clone YOUR_REPOSITORY_URL /var/www/hydranet
cd /var/www/hydranet
sudo bash deploy/vps/setup.sh broadband.example.com
```

The default install location is `/var/www/hydranet`. To use another location:

```bash
sudo APP_DIR=/srv/hydranet bash deploy/vps/setup.sh broadband.example.com
```

## Install by cloning from the script

```bash
sudo REPO_URL=https://github.com/OWNER/REPO.git \
  bash deploy/vps/setup.sh broadband.example.com
```

For a private repository, authenticate Git on the VPS using your normal
provider-supported method. Do not put access tokens in this script or commit
them to the repository.

## Configure production secrets

The installer creates `/etc/hydranet/backend.env` with safe file permissions.
Edit it with the real MongoDB Atlas connection string and application secrets:

```bash
sudo nano /etc/hydranet/backend.env
sudo chmod 600 /etc/hydranet/backend.env
sudo systemctl restart hydranet-backend
sudo systemctl status hydranet-backend --no-pager
```

Add the VPS public IP to the MongoDB Atlas network access list. After HTTPS is
enabled, set `CORS_ORIGINS` to the final `https://` origin and restart FastAPI.

## Enable HTTPS

After the DNS A record resolves to the VPS:

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d broadband.example.com
```

Certbot configures renewal automatically. If using `www`, include it as an
additional `-d` name and create its DNS record first.

## Update the application

```bash
cd /var/www/hydranet
sudo git pull
sudo -u www-data bash -lc 'cd /var/www/hydranet/frontend && sed -i -e "s#http://package-firewall\\.replit\\.local/npm/#https://registry.npmjs.org/#g" -e "s#https://package-firewall\\.replit\\.local/npm/#https://registry.npmjs.org/#g" yarn.lock && yarn config set registry https://registry.npmjs.org/ && yarn install --frozen-lockfile && REACT_APP_BACKEND_URL="" yarn build'
sudo systemctl restart hydranet-backend
sudo systemctl reload nginx
```

If `APP_DIR` is different, replace `/var/www/hydranet` in the commands.

The installer and update command normalize Replit-only package URLs in the
lockfile. `package-firewall.replit.local` is only reachable inside Replit and
must not be used by an external VPS.

## Troubleshooting

```bash
sudo systemctl status hydranet-backend nginx --no-pager
sudo journalctl -u hydranet-backend -n 200 --no-pager
sudo nginx -t
curl -i http://127.0.0.1:8000/api/
curl -I http://127.0.0.1/
```

If the public site is unreachable, verify the VPS provider firewall, local
firewall, DNS record, and that both systemd services are active.