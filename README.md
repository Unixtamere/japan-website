# 🌸 Japan Trip Tracker

An anime-style, responsive website to show and track your flights and activities for a trip to Japan. Built with **React + Vite**.

![sakura](public/sakura.svg)

## Features

- ✈️ **Flight cards** — airline, route, times, seat, and a status badge (On time / Boarding / Delayed / Landed / Cancelled) you can change with one tap.
- 📡 **Live flight status** — hit **↻ Live** on a flight to pull its real status, route, times, terminal and gate from a flight API (by flight number + date).
- 🗺️ **Activity tracker** — check things off as you do them, filter by city, and watch the progress bar fill up.
- 📸 **Gallery** — upload photos and add YouTube videos, viewed in a lightbox.
- 🔐 **Shared & server-stored** — the trip lives on the server, so every visitor
  sees the same activities and photos. Editing is gated by a passcode
  (`EDIT_PASSCODE`); logged-out visitors get a read-only view.
- ⏳ **Live countdown** to your departure.
- 🌸 Anime aesthetic: sakura palette, rounded Japanese-friendly fonts, falling petals.
- 📱 Fully responsive (looks great on phone and desktop).

## Getting started

You need [Node.js](https://nodejs.org) (v18+).

```bash
npm install        # first time only
# create .env with AERODATABOX_KEY and EDIT_PASSCODE (see .env.example)
npm run dev:all    # Vite (:5173) + API server (:3001) together
```

Other commands:

```bash
npm run build    # production build into dist/
npm start        # run the server (serves dist/ + API) → http://localhost:3001
```

Data is stored server-side in `server/data/` (trip JSON + uploaded photos).
See [DEPLOY.md](DEPLOY.md) for putting it on a VPS.

## Live flight status (free API)

The **↻ Live** button on each flight card fetches real status by flight number + date.

> **Note on FlightRadar24:** FR24's API is a paid B2B product, needs an API token,
> and can't be called from the browser (CORS + the key would be exposed). So this
> uses **AeroDataBox**, which has a free tier and the same "lookup by flight number"
> capability. A tiny dev-only proxy inside `vite.config.js` keeps the key secret.

**Setup (one time):**

1. Sign up at [rapidapi.com](https://rapidapi.com/) and subscribe to the free
   **Basic** tier of [AeroDataBox](https://rapidapi.com/aedbx-aedbx/api/aerodatabox).
2. Copy `.env.example` to `.env` and paste your key into `AERODATABOX_KEY=`.
3. Restart `npm run dev` (env changes are only read at startup).

Then click **↻ Live** on a flight. Without a key you'll see a friendly
"No API key set" message instead.

⚠️ Free-tier limits: AeroDataBox only covers a date window around today (roughly
±7 days), so flights far in the future may return "no data" until closer to the date.
The **↻ Live** button only works while running `npm run dev` (it relies on the dev proxy);
a fully deployed version would need a serverless function to hold the key.

## Customising your trip

Open [`src/data/trip.js`](src/data/trip.js) and edit:

- `tripMeta` — title, subtitle, and your departure/return dates (the countdown uses `startDate`).
- `flights` — your flights.
- `activities` — your itinerary.

This file is only the **seed**: the first time the server starts with no
`server/data/trip.json`, it copies this in. After that, the server's JSON file
is the source of truth — edit the trip live in the browser (logged in), and it's
saved on the server for everyone. To re-seed from `trip.js`, stop the server and
delete `server/data/trip.json`.

## Deploying

See [DEPLOY.md](DEPLOY.md) for the full VPS setup (Node + nginx + HTTPS). It's no
longer a pure static site — it needs the Node server running to store and serve
the shared trip data.
