# Deploying to a VPS

This app is a Vite/React frontend plus a Node server
([`server/index.js`](server/index.js)) that:
- stores the **one shared trip** on disk (`server/data/trip.json`) and uploaded
  photos in `server/data/uploads/`, so every visitor sees the same data,
- enforces editing with a server-side passcode (`EDIT_PASSCODE`),
- proxies live flight status (`/api/flight`, key kept server-side),
- serves the built frontend.

Recommended stack: **Node + nginx + Let's Encrypt** on Ubuntu/Debian.

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
