# Saddle Up 🐴

Modern horse & stable management software for riding schools, trainers, and horse owners. Replace WhatsApp, notebooks, and Excel with one place for everything.

## Features

### Core (MVP)
- **Horse Profiles** — Digital passport: name, breed, age, temperament, skill level, training status, riding suitability
- **Training Punches** — Log sessions, lessons, free rides, competition, rest days, medical rest. Duration, intensity, discipline, rider, notes
- **Workload Intelligence** — Weekly workload, overuse alerts, recommended rest days
- **Rider/Student Management** — Profiles, riding level, progress notes, instructor feedback
- **Health & Care Logs** — Vet visits, vaccinations, deworming, farrier, injuries with recovery status
- **Schedule & Availability** — Horse workload calendar, avoid overworking

### Tech Stack
- **Frontend:** Next.js 16, React 19, Tailwind CSS
- **Backend:** Next.js API Routes, Prisma
- **Database:** SQLite (dev) — switch to PostgreSQL for production

## Getting Started

```bash
# Install dependencies
npm install

# Run migrations
npx prisma migrate dev

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
├── page.tsx              # Landing page
├── dashboard/
│   ├── page.tsx          # Dashboard with workload alerts
│   ├── horses/
│   │   ├── page.tsx      # Horse list, add, log session
│   │   └── [id]/page.tsx # Horse detail, health logs
│   ├── riders/page.tsx   # Rider/student management
│   └── schedule/page.tsx # Workload calendar
├── api/
│   ├── horses/           # CRUD horses
│   ├── sessions/         # Training punches
│   ├── riders/           # CRUD riders
│   └── health/           # Health logs
prisma/
└── schema.prisma         # Horse, Session, Rider, HealthLog
```

## Roadmap

- [ ] Horse–rider matching engine
- [ ] Progress & value reports
- [ ] Mobile-first "barn mode" (one-tap punch)
- [ ] Auth (email + optional WhatsApp)
- [ ] Lesson booking
- [ ] Business tools (invoices, payments)
