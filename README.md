# Battleship Game 🛳️🎯

**Live demo:** [https://battleship11.netlify.app](https://battleship11.netlify.app)
**Backend API:** Render‑hosted Node.js WebSocket server.

A real‑time, two‑player Battleship game: open the link, share a 6‑digit room code, place your fleet, and sink your friend’s ships — all in the browser.

---

## Tech & Tools

### Runtime

* **Node.js 20** – modern, LTS JavaScript runtime.
* **Express 4** – minimal HTTP server for static assets & health checks.
* **ws** – lightweight WebSocket library powering the real‑time channel.

### Language

* **TypeScript 5** – end‑to‑end typing; shared interfaces live in `/common`.

### Client‑Side Libraries

* **jQuery 3** – concise DOM manipulation & event delegation.
* **SCSS** – modular styling with variables & mixins.

### Build Toolchain

* **Webpack 5** – bundler with code‑splitting & tree‑shaking.
* **ts‑loader** – compiles TypeScript inside Webpack.
* **Babel** – optional transpilation to older browsers.
* **sass‑loader · css‑loader · style‑loader** – compile & inject SCSS.

### Developer Experience

* **webpack‑dev‑server** – hot module reload for the client.
* **ts‑node‑dev** – auto‑restart for the Node server.
* **dotenv** – environment variable management.
* **Husky + lint‑staged** – pre‑commit lint & format.

### Quality

* **ESLint** – static analysis with Airbnb + TS rules.
* **Prettier** – consistent code style.

### Deployment

* **Render** – auto‑deploy backend on push, free tier.
* **Netlify** – build & host static front‑end with preview deploys.

\-------|-------|
\| **Client** | jQuery · SCSS · HTML5 Drag‑&‑Drop |
\| **Server** | Node.js 20 · TypeScript · `ws` · `express` |
\| **Build**  | Webpack 5 · Babel · `ts-loader` |
\| **Quality**| ESLint · Prettier · Husky + lint‑staged |

---

## Installation & Local Setup (npm)

### Prerequisites

* **Node.js ≥ 20**
* **npm ≥ 9**

### 1 — Clone & install

```bash
git clone https://github.com/adimalka14/battleship-game.git
cd battleship-game
npm install
```

### 2 — Run locally

```bash
# Terminal 1 – start the WebSocket server (port 4000)
npm run dev:server

# Terminal 2 – launch the Webpack dev‑server (port 8080)
npm run dev:client

# Open http://localhost:8080 in your browser.
```

### 3 — Build production bundle

```bash
npm run build   # bundles client into ./dist
npm start       # serves dist & starts the server in prod mode
```

---

## Front‑End Design & Outcome

| Screenshot                        | Description                                              |
| --------------------------------- | -------------------------------------------------------- |
| ![Lobby](docs/assets/lobby.png)   | **Lobby** – create or join a 6‑digit room.               |
| ![Setup](docs/assets/setup.png)   | **Setup** – drag ships onto a responsive 10×10 grid.     |
| ![Battle](docs/assets/battle.png) | **Battle** – turn‑based firing with hit/miss animations. |

**Design goals**

1. **Lightweight** – initial payload < 200 kB gzipped.
2. **Mobile‑first** – works down to 360×640 screens.
3. **Accessible** – full keyboard support + ARIA live regions.
