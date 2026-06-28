# Deploying to a VPS

This app is a Vite/React frontend plus a Node server
([`server/index.js`](server/index.js)) that:
- stores the **one shared trip** on disk (`server/data/trip.json`) and uploaded
  photos in `server/data/uploads/`, so every visitor sees the same data,
- enforces editing with a server-side passcode (`EDIT_PASSCODE`),
- proxies live flight status (`/api/flight`, key kept server-side),
- serves the built frontend.

Recommended stack: **Node + nginx + Let's Encrypt** on Ubuntu/Debian.

> 🐳 **Prefer Docker?** Skip sections 1–4 and jump to
> [Running with Docker + Traccar + HTTPS](#running-with-docker--traccar--https)
> at the bottom — that's the one-command path that also brings up the live
> location server.

> ⚠️ **Serve over HTTPS.** The passcode is sent to the server on login; without
> TLS it would travel in clear text. Certbot (step 5) sets this up.

> 💾 **`server/data/` is your database — back it up.** It holds the trip JSON and
> all uploaded photos, and is gitignored. Keep it on persistent storage and
> don't delete it on redeploys (see "Updating later"). The gallery isn't
> capped at 5 MB anymore — photos are real files on the server's disk.

---

## 1. Prerequisites on the VPS

```bash
# Node 18+ (this app was built/tested on Node 24)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs nginx
```

## 2. Get the code & build

```bash
sudo mkdir -p /var/www/japan-website
sudo chown -R $USER:$USER /var/www/japan-website
# copy the repo here (git clone / scp / rsync), then:
cd /var/www/japan-website
npm install
npm run build        # produces dist/
```

## 3. Add your secrets (server-side only)

```bash
# /var/www/japan-website/.env
cat > .env <<'EOF'
AERODATABOX_KEY=your_rapidapi_key_here
EDIT_PASSCODE=choose-a-private-passcode
EOF
```

- `AERODATABOX_KEY` — powers the ↻ Live flight button (optional; without it that
  button returns 503, everything else works).
- `EDIT_PASSCODE` — the passcode that unlocks editing. Anyone who knows it can
  add/remove activities, photos and videos. **Without it, editing is disabled.**

`.env` is gitignored — it never ends up in the build or the repo.

## 4. Run it as a service

```bash
sudo cp deploy/japan-website.service /etc/systemd/system/
# edit WorkingDirectory / User / node path if needed
sudo systemctl daemon-reload
sudo systemctl enable --now japan-website
curl http://127.0.0.1:3001/api/flight/AF292/2026-07-01   # smoke test
```

(Alternative to systemd: `npm i -g pm2 && pm2 start server/index.js --name japan-website && pm2 save`.)

## 5. nginx + HTTPS

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/japan-website
# edit server_name to your domain
sudo ln -s /etc/nginx/sites-available/japan-website /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# point your domain's A record at the VPS first, then:
sudo apt-get install -y certbot python3-nginx
sudo certbot --nginx -d your-domain.com
```

Certbot rewrites the nginx config to add HTTPS and the HTTP→HTTPS redirect.

## 6. Updating later

```bash
cd /var/www/japan-website
git pull            # or re-copy files — server/data is gitignored, so it stays
npm install
npm run build
sudo systemctl restart japan-website
```

⚠️ Don't delete `server/data/` on redeploys — that's where the shared trip and
all photos live. Back it up regularly, e.g. `tar czf backup.tgz server/data`.

## Local development

Run the frontend and API together:

```bash
npm run dev:all     # Vite on :5173 (proxies /api + /uploads to the API on :3001)
```

Make sure your local `.env` has `AERODATABOX_KEY` and `EDIT_PASSCODE` set. Local
trip data/photos live in `server/data/` just like production.

---

## Optional: let nginx serve the static files directly

The Node server already serves `dist/`, which is simplest. If you prefer nginx
to serve static assets (slightly faster) and only proxy the API, swap the
`location /` block in `nginx.conf` for:

```nginx
root /var/www/japan-website/dist;
index index.html;

location / {
    try_files $uri /index.html;
}

location /api/ {
    proxy_pass http://127.0.0.1:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

---

## Running with Docker + Traccar + HTTPS

This is the recommended single-box setup: the trip site **and** the Traccar
live-location server run as containers (`compose.yml`), while nginx on the host
terminates TLS for both. A ~2 GB / 2 vCPU VPS handles it comfortably; 4 GB gives
headroom for building on the box.

### 1. DNS

Point **two** A records at the VPS IP before requesting certificates:

- `your-domain.com` → the trip site
- `traccar.your-domain.com` → the Traccar web UI

### 2. Install Docker + nginx + certbot

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo apt-get install -y nginx certbot python3-certbot-nginx
```

### 3. Secrets

```bash
cd /var/www/japan-website        # wherever you cloned the repo
cat > .env <<'EOF'
AERODATABOX_KEY=your_rapidapi_key_here
EDIT_PASSCODE=choose-a-private-passcode
# Traccar — fill these in AFTER step 5 once you've created the account.
TRACCAR_EMAIL=
TRACCAR_PASSWORD=
TRACCAR_DEVICE_ID=
EOF
```

`compose.yml` reads this file automatically. `TRACCAR_URL` is already set to
`http://traccar:8082` inside compose — the web container reaches Traccar over the
internal Docker network, so you don't set it here.

### 4. Bring up the containers

```bash
sudo docker compose up -d --build
```

This starts `web` (on `127.0.0.1:3001`) and `traccar` (UI on `127.0.0.1:8082`,
device port `5055` open to the internet). Only nginx faces the public web for the
two HTTP services; `5055` is the one port your phone pushes GPS to directly.

### 5. Create your Traccar login + device

```bash
# temporarily reachable via the IP, or wait until nginx+TLS is up in step 7
```

Open `https://traccar.your-domain.com` (after step 7) or `http://VPS_IP:8082`
(before it), then:

1. Register — **the first account you create becomes the admin.** That
   email/password go into `.env` as `TRACCAR_EMAIL` / `TRACCAR_PASSWORD`.
2. **+ Add Device** → set a name and a unique **Identifier**. Note the numeric
   device ID it's assigned → that's `TRACCAR_DEVICE_ID` (optional; blank uses the
   first device on the account).
3. On your phone, install **Traccar Client** (iOS/Android) and set:
   - Server URL: `http://YOUR_VPS_IP:5055`
   - Device identifier: the same Identifier from step 2

Then update `.env` and reload the web container so it picks up the credentials:

```bash
sudo docker compose up -d web
```

### 6. nginx config

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/japan-website
sudo sed -i 's/your-domain.com/REALDOMAIN/g' /etc/nginx/sites-available/japan-website  # or edit by hand
sudo ln -s /etc/nginx/sites-available/japan-website /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

`deploy/nginx.conf` already contains both server blocks (site + Traccar
subdomain, with the websocket headers Traccar's live map needs).

### 7. HTTPS for both names with Let's Encrypt

One certbot command covers both hostnames and rewrites the nginx config to add
the TLS blocks and HTTP→HTTPS redirects:

```bash
sudo certbot --nginx \
  -d your-domain.com \
  -d traccar.your-domain.com \
  --redirect --agree-tos -m you@example.com
```

Certbot installs a systemd timer that auto-renews (certs last 90 days); verify
with:

```bash
sudo certbot renew --dry-run
```

### 8. Firewall

Open only what you need:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'   # 80 + 443
sudo ufw allow 5055/tcp       # Traccar device protocol (your phone -> server)
sudo ufw enable
```

### Updating later

```bash
cd /var/www/japan-website
git pull
sudo docker compose up -d --build
```

Named volumes (`japan-data`, `traccar-data`, `traccar-logs`) survive rebuilds —
your trip, photos, and location history persist. Back them up periodically:

```bash
sudo docker run --rm -v japan-website_traccar-data:/d -v "$PWD":/b alpine \
  tar czf /b/traccar-backup.tgz -C /d .
```

> ⚠️ **Don't expose Traccar's `8082` or `5055` more than needed.** `8082` stays
> on localhost (nginx fronts it with TLS); `5055` is plain TCP by design — it
> only carries position reports, but keep it to the single port above.
