# WanderGlobe — Travel Itinerary Maker

A React + Tailwind travel planner with a 3D globe, Gemini AI itineraries, expense splitting, and social features — all running in your browser with localStorage.

## Setup

```bash
cd ~/travel-itinerary-maker
npm install
cp .env.example .env
# Add your Gemini API key to .env
npm run dev
```

Open http://localhost:5173

## Gemini API key

Create a `.env` file:

```
VITE_GEMINI_API_KEY=your_actual_key_here
```

Get a key at [Google AI Studio](https://aistudio.google.com/apikey).

## Features

### Phase 1 — Core (implemented)
- Create multi-city trips with day counts
- Interactive 3D globe with route arcs
- Gemini-generated itinerary options (2–3 plans)
- Hotel/base location + AI hotel suggestions
- Food recommendations per day
- Add travel companions
- Splitwise-style expense tracking
- Export trip as JSON

### Phase 2 — Collaboration (local now, Supabase ready)
- Expenses split among travelers (localStorage)
- See `supabase/README.md` for cloud auth, shared plans, and protected Gemini key

### Phase 3 — Social (local now)
- Publish trips to Explore feed
- Collections with personal notes
- Comments on shared itineraries
- Friend activity tracking
- Travel photo posts
- Find travelers planning the same city

## Tech stack

- Vite + React (JavaScript/JSX)
- Tailwind CSS
- React Router
- react-globe.gl
- localStorage
- Gemini API (fetch)

## Project structure

```
src/
├── components/   # UI components
├── context/      # TripContext + SocialContext
├── pages/        # Route pages
├── services/     # Gemini, cities lookup
└── utils/        # JSON parsing helpers
```
