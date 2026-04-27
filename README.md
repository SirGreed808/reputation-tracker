# RepuTrack — Reputation Dashboard

A live-demo reputation tracking dashboard for local businesses. Built to show prospective clients what their review monitoring could look like — no login required, demo data loads instantly.

**[View Live Demo](https://reviews.honestdev808.com)**

---

## What It Is

RepuTrack helps small business owners — auto shops, restaurants, salons, clinics — monitor and respond to customer reviews across platforms. This repo is the **frontend demo** that loads with placeholder data so anyone can experience the product immediately.

### Features Shown

| Feature | What It Does |
|---|---|
| **Reputation Health Score** | Aggregated 0-100 score from rating, volume, recency, and response rate |
| **90-Day Trend Chart** | Visualizes reputation score + average rating over time |
| **Review Feed** | All reviews with sentiment tags, platform badges, and response tracking |
| **Filter & Search** | Filter by positive / neutral / negative sentiment |
| **Overdue Alerts** | Highlights negative reviews unanswered for 48+ hours |
| **Follow-up Requests** | Send email review requests, preview SMS, generate QR codes |
| **Live Demo Mode** | Loads instantly with demo data — no signup or login |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite |
| Routing | React Router |
| Charts | Chart.js via react-chartjs-2 |
| Styling | Pure CSS — no Tailwind, no component library |
| Design | Glassmorphism cards, ambient animated background, Inter + Playfair Display |

---

## Screenshots

*(Add screenshots here once deployed)*

| Dashboard | Reviews | Follow-ups |
|---|---|---|
| ![Dashboard]() | ![Reviews]() | ![Follow-ups]() |

---

## Running Locally

```bash
cd frontend
npm install
npm run dev
```

The dev server starts at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

Output goes to `frontend/dist/`.

---

## Project Structure

```
frontend/
  src/
    components/     # ScoreCard, TrendChart, ReviewFeed, TopNav
    pages/          # Dashboard, Reviews, Followups
    lib/            # API client
    types.ts        # Shared TypeScript types
    index.css       # All styling — glassmorphism, animations, ambient bg
    App.tsx         # Router + ambient background
```

---

## Backend

The full stack includes a Node/Express API with:

- PostgreSQL for review storage
- Resend for email follow-ups
- QR code generation for printable review cards
- Twilio-ready SMS (simulated in demo)

See the `server/` directory for the backend code.

---

## Customization for Clients

To white-label this demo for a prospect:

1. **Business name** — edit `src/pages/Dashboard.tsx` line 30
2. **Location** — edit `src/pages/Dashboard.tsx` line 31
3. **Brand colors** — update CSS variables in `src/index.css` `:root`
4. **Demo data** — modify the seed script in `server/src/seed.ts`

---

## Design Notes

- **Glassmorphism** — frosted glass cards with backdrop-filter blur
- **Ambient background** — 4 slowly drifting colored orbs (amber, coral, gold, indigo)
- **No dark mode** — warm light theme throughout
- **Accessible** — WCAG 2.1 AA contrast ratios, keyboard-navigable

---

## License

MIT — built by [Honest Dev Consulting](https://honestdev808.com).

---

*This is a portfolio demo piece. Want something similar for your business? [Get in touch](https://honestdev808.com).*
