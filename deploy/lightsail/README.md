# AWS Lightsail deployment

This project is deployed as:

- React production build: Nginx serves `frontend/build`
- FastAPI: systemd + Uvicorn on `127.0.0.1:8000`
- MongoDB: existing MongoDB Atlas connection from `MONGO_URL`
- `/api/*`: Nginx reverse proxy to FastAPI

## 1. Create the Lightsail server

Create an Ubuntu 22.04 or 24.04 Lightsail instance, attach a static IP, and allow:

- TCP 22 for SSH
- TCP 80 for HTTP
- TCP 443 for HTTPS

Point the domain's DNS A record to the static IP.

## 2. Upload or clone the project

```bash
sudo mkdir -p /var/www
sudo git clone YOUR_REPOSITORY_URL /var/www/hydranet
cd /var/www/hydranet
```

If the repository is private, clone it using your normal authenticated Git setup.

## 3. Run the installer

```bash
sudo bash deploy/lightsail/setup.sh broadband.example.com
```

For a clean server where the script should clone the repository:

```bash
sudo REPO_URL=https://github.com/OWNER/REPO.git \
  bash deploy/lightsail/setup.sh broadband.example.com
```

## 4. Add production secrets

Edit the file created by the installer:

```bash
sudo nano /etc/hydranet/backend.env
sudo chmod 600 /etc/hydranet/backend.env
sudo systemctl restart hydranet-backend
sudo systemctl status hydranet-backend --no-pager
```

The MongoDB Atlas network access list must allow the Lightsail static IP.

## 5. Enable HTTPS

After DNS resolves:

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d broadband.example.com
```

Certbot will configure renewal automatically. Update `CORS_ORIGINS` in
`/etc/hydranet/backend.env` to the final `https://` domain and restart FastAPI.

## Updating the app

```bash
cd /var/www/hydranet
sudo git pull
sudo -u www-data bash -lc 'cd /var/www/hydranet/frontend && yarn install --frozen-lockfile && REACT_APP_BACKEND_URL="" yarn build'
sudo systemctl restart hydranet-backend
sudo systemctl reload nginx
```

## Troubleshooting

```bash
sudo systemctl status hydranet-backend nginx --no-pager
sudo journalctl -u hydranet-backend -n 200 --no-pager
sudo nginx -t
curl -i http://127.0.0.1:8000/api/
curl -I http://127.0.0.1/
```