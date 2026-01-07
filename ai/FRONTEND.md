# Frontend Implementation

## Stack

- **Framework**: Next.js 15.1.0 (App Router)
- **Runtime**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3
- **Build**: Turbopack (dev), Webpack (prod)
- **Deployment**: Vercel

---

## Project Structure

```
frontend/src/
├── app/                        # Pages (App Router)
│   ├── layout.tsx              # Root layout with AuthProvider
│   ├── page.tsx                # Home page
│   ├── globals.css             # Global styles + Tailwind
│   │
│   ├── tournaments/
│   │   ├── page.tsx            # Tournament list
│   │   └── [id]/
│   │       ├── layout.tsx      # Tournament header + tabs
│   │       ├── regulations/
│   │       │   └── page.tsx    # Tournament info
│   │       └── participants/
│   │           └── page.tsx    # Participant management
│   │
│   ├── player/
│   │   └── [id]/
│   │       └── page.tsx        # Player profile
│   │
│   ├── rating/
│   │   └── page.tsx            # Leaderboard
│   │
│   └── api/
│       └── import-csv/
│           └── route.ts        # CSV import endpoint (legacy)
│
├── components/                 # Reusable components
│   ├── Header.tsx              # Navigation bar
│   ├── LoginModal.tsx          # Login popup
│   ├── TournamentList.tsx      # Tournament cards with filters
│   ├── CreateTournamentModal.tsx
│   ├── AddParticipantModal.tsx # Search or create player
│   ├── CountdownTimer.tsx      # Real-time countdown
│   ├── RatingChart.tsx         # Player rating graph (SVG)
│   ├── PlayerCard.tsx          # Player display card
│   ├── Leaderboard.tsx         # Top players table
│   └── MatchHistory.tsx        # Match list
│
├── context/                    # Global state
│   ├── AuthContext.tsx         # User session, login/logout
│   └── AppContext.tsx          # App state (future)
│
├── types/                      # TypeScript definitions
│   └── index.ts                # All interfaces
│
└── utils/                      # Helper functions
    ├── rating.ts               # getRatingBand, getRatingColor
    └── discipline.ts           # getDisciplineLabel
```

---

## Key Concepts

### App Router (Next.js 15)

- **Server Components by default** (good for SEO, performance)
- **Client Components** marked with `'use client'`
- **Layouts** wrap pages (persistent UI like headers)
- **Dynamic routes**: `[id]` folder = parameter

Example structure:
```
/tournaments           → tournaments/page.tsx
/tournaments/123       → tournaments/[id]/page.tsx
/tournaments/123/participants → tournaments/[id]/participants/page.tsx
```

### Client vs Server Components

**Server Components** (default):
- Render on server
- Good for data fetching
- Can't use useState, useEffect, onClick
- Can directly access backend

**Client Components** (`'use client'`):
- Render in browser
- Can use hooks, interactivity
- Used for forms, modals, dynamic UI

All interactive components in this project are Client Components.

---

## Pages

### Home Page (`app/page.tsx`)

**Purpose**: Landing page with overview

**Content**:
- Hero section
- Rating bands explanation
- Feature highlights
- Link to leaderboard

**Note**: Static, no API calls

---

### Tournament List (`app/tournaments/page.tsx`)

**Purpose**: Browse all tournaments

**Features**:
- Filter by status (all, registration, in_progress, finished)
- Display tournament cards
- "Create Tournament" button (admin only)
- Registration countdown

**API Calls**:
- GET /api/tournaments/

**Components Used**:
- TournamentList
- CreateTournamentModal (if admin)

---

### Tournament Layout (`app/tournaments/[id]/layout.tsx`)

**Purpose**: Shared header + tabs for tournament pages

**Features**:
- Tournament name, city, club
- Status badge
- Tab navigation: Regulations | Participants
- Fetches tournament data once

**API Calls**:
- GET /api/tournaments/{id}

**Note**: Layout persists across tab changes

---

### Tournament Regulations (`app/tournaments/[id]/regulations/page.tsx`)

**Purpose**: Display tournament info

**Content**:
- Description
- Discipline (with Ukrainian name)
- Location (city, club, country)
- Dates (registration + tournament)
- Countdown timer
- Registered players count
- Registration button (if user + tournament open)

---

### Tournament Participants (`app/tournaments/[id]/participants/page.tsx`)

**Purpose**: Manage tournament participants

**Features**:
- **3 Tabs**: All / Confirmed / Pending
- **Countdown** to registration end
- **Self-register** button (users with player profile)
- **Add participant** button (admin) → opens modal
- **Participant list**:
  - Seed number (for confirmed)
  - Player name (colored by rating)
  - Rating + status badge
  - "Registered by admin" indicator
- **Admin controls** (visible during registration):
  - Confirm pending
  - Reject pending
  - Remove participant

**API Calls**:
- GET /api/tournaments/{id}/participants?status_filter=...
- POST /api/tournaments/{id}/participants/register
- POST /api/tournaments/{id}/participants/add
- PATCH /api/tournaments/{id}/participants/{pid}/confirm
- PATCH /api/tournaments/{id}/participants/{pid}/reject
- DELETE /api/tournaments/{id}/participants/{pid}

**State Management**:
- activeTab: 'all' | 'confirmed' | 'pending'
- participants: TournamentParticipant[]
- loading, actionLoading, error, success

---

### Player Profile (`app/player/[id]/page.tsx`)

**Purpose**: Show player stats and match history

**Features**:
- Current rating (with color + rank)
- Peak rating
- Statistics (wins/losses/winrate)
- Rating chart (historical)
- Match history table
- Badge if rating peak > current (fallen from peak)

**API Calls**:
- GET /api/players/{id}
- GET /api/matches/?player_id={id}

---

### Leaderboard (`app/rating/page.tsx`)

**Purpose**: Top players list

**Features**:
- Sortable table (rating, matches, etc.)
- Rank numbers
- Rating colors
- Search by name

**API Calls**:
- GET /api/players/

---

## Components

### Header.tsx

**Purpose**: Navigation bar

**Features**:
- Logo / home link
- Nav links: Tournaments, Rating, Players
- Login button (if not logged in)
- User menu (if logged in): username, role, logout
- Responsive mobile menu

**State**: Uses AuthContext

---

### LoginModal.tsx

**Purpose**: Login popup

**Features**:
- Username + password fields
- Submit → POST /api/auth/login/
- Store token in localStorage
- Update AuthContext on success
- Show error messages

---

### TournamentList.tsx

**Purpose**: Display tournament cards with filters

**Features**:
- Status filter buttons
- Tournament cards:
  - Name, city, club
  - Status badge (color-coded)
  - Registration deadline
  - Countdown (if registration open)
  - isRated badge
  - Participant count
- Click card → go to tournament page

---

### CreateTournamentModal.tsx

**Purpose**: Create new tournament (admin only)

**Fields**:
- Name, description
- City, country, club
- Discipline (dropdown)
- Registration end (required)
- Start date, end date
- isRated checkbox

**API**: POST /api/tournaments/

---

### AddParticipantModal.tsx

**Purpose**: Admin tool to add players

**Features**:
- **Two modes**:
  1. Search existing players
  2. Create new player

**Search Mode**:
- Live search by name/ID
- Player list sorted by rating
- Rating colors
- "Add" button → POST /api/tournaments/{id}/participants/add

**Create Mode**:
- Name (required)
- Rating (default 1200, quick buttons for ranks)
- City (optional)
- "Create and add to tournament" button
- Calls: POST /api/players/ then POST .../participants/add

---

### CountdownTimer.tsx

**Purpose**: Real-time countdown to date

**Props**:
- targetDate: ISO string

**Display**:
- "X днів Y годин Z хвилин W секунд"
- Updates every second
- Shows "Реєстрація завершена" when expired
- Gradient background

---

### RatingChart.tsx

**Purpose**: SVG line chart of player rating over time

**Features**:
- X-axis: match dates
- Y-axis: rating
- Rating bands as background zones (colored)
- Line connecting match points
- Hover tooltips:
  - Opponent name
  - Score
  - Rating change
  - Date
- Legend showing rating levels
- Shows next rating goal

---

### PlayerCard.tsx

**Purpose**: Display player in list

**Features**:
- Colored border (rating band)
- Name (bold)
- Current rating
- Rank number (if provided)
- Peak rating (if showPeakRating=true)
- Click → go to player profile

---

## State Management

### AuthContext

**Location**: `context/AuthContext.tsx`

**Provides**:
```typescript
{
  user: { username, role, playerId } | null,
  login: (username, password) => Promise<void>,
  logout: () => void,
  isAdmin: boolean,
  loading: boolean
}
```

**Usage**:
```tsx
const { user, isAdmin, login, logout } = useAuth();

if (isAdmin) {
  // Show admin controls
}
```

**Storage**: Token in localStorage

---

## Data Flow Examples

### User Self-Registration for Tournament

```
1. User clicks "Зареєструватись"
   ↓
2. ParticipantsPage.handleRegister()
   ↓
3. Checks: user exists, has player_id
   ↓
4. POST /api/tournaments/{id}/participants/register
   Headers: Authorization: Bearer <token>
   ↓
5. Backend validates, creates registration (status=pending)
   ↓
6. Returns 201 Created
   ↓
7. Frontend shows success message
   ↓
8. Refetches participant list
   ↓
9. User appears in "Pending" tab
```

### Admin Confirms Pending Participant

```
1. Admin clicks "Підтвердити"
   ↓
2. ParticipantsPage.handleConfirm(participantId)
   ↓
3. PATCH /api/tournaments/{id}/participants/{pid}/confirm
   ↓
4. Backend changes status: pending → confirmed
   ↓
5. Returns 200 OK
   ↓
6. Frontend refetches list
   ↓
7. Participant moves to "Confirmed" tab
```

---

## TypeScript Types

### Key Interfaces

```typescript
// User
interface User {
  username: string;
  role: 'admin' | 'user';
  playerId?: number;
}

// Player
interface Player {
  id: string;
  name: string;
  rating: number;
  initialRating?: number;
  peakRating?: number;
  matches: string[];
  city?: string;
  isCMS?: boolean;
}

// Tournament
interface Tournament {
  id: number;
  name: string;
  description?: string;
  status: TournamentStatus;
  registrationStart?: string;
  registrationEnd: string;
  startDate?: string;
  endDate?: string;
  city: string;
  country: string;
  club: string;
  discipline: TournamentDiscipline;
  isRated: boolean;
  createdByAdminId: number;
  createdAt: string;
  registeredCount: number;
  isRegistered?: boolean;
}

// TournamentParticipant
interface TournamentParticipant {
  id: number;
  playerId: number;
  playerName: string;
  rating: number;
  status: ParticipantStatus;
  seed?: number;
  registeredAt: string;
  confirmedAt?: string;
  registeredByAdmin: boolean;
}
```

### Enums

```typescript
type TournamentStatus = 'registration' | 'in_progress' | 'finished';
type ParticipantStatus = 'pending' | 'confirmed' | 'rejected' | 'active' | 'eliminated';
type TournamentDiscipline = 
  | 'FREE_PYRAMID'
  | 'DYNAMIC_PYRAMID'
  | 'COMBINED_PYRAMID'
  | 'FREE_PYRAMID_EXTENDED'
  | 'COMBINED_PYRAMID_CHANGES'
  | 'MOSCOW_PYRAMID'
  | 'NEVSKY_PYRAMID';
```

**CRITICAL NOTE**: 
- Frontend sends uppercase discipline names (e.g., "FREE_PYRAMID")
- Backend converts to lowercase (e.g., "free_pyramid") via field_validator
- Database stores lowercase values only
- Frontend displays Ukrainian names via `getDisciplineLabel()` utility

---

## Styling (Tailwind CSS)

### Color Scheme

**Rating Colors**:
- Gray (0-1199): `text-gray-600` - Новачок (Newbie)
- Green (1200-1399): `text-green-600` - Учень (Pupil)
- Cyan (1400-1599): `text-cyan-600` - Спеціаліст (Specialist)
- Blue (1600-1899): `text-blue-600` - Експерт (Expert)
- Purple (1900-2099): `text-purple-600` - Кандидат у Майстри (Candidate Master)
- Orange (2100-2399): `text-orange-600` - Майстер/Міжнародний Майстер (Master/IM)
- Red (2400+): `text-red-600` - Гросмейстер (Grandmaster)

**Status Badges**:
- Registration: `bg-blue-100 text-blue-800`
- In Progress: `bg-yellow-100 text-yellow-800`
- Finished: `bg-gray-100 text-gray-800`
- Pending: `bg-yellow-100 text-yellow-700`
- Confirmed: `bg-green-100 text-green-700`
- Rejected: `bg-red-100 text-red-700`

---

## API Integration

### Base URL
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
```

**Production**:
- Frontend: https://rating-app-mu-murex.vercel.app
- Backend: https://rating-app-000c25dfc4f1.herokuapp.com
- Set in Vercel environment variables: `NEXT_PUBLIC_API_URL`

### Standard Fetch Pattern
```typescript
const token = localStorage.getItem('auth_token');
const headers: HeadersInit = {
  'Content-Type': 'application/json'
};

if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}

const response = await fetch(`${API_URL}/api/endpoint`, {
  method: 'POST',
  headers,
  body: JSON.stringify(data)
});

if (!response.ok) {
  const error = await response.json();
  throw new Error(error.detail || 'Error');
}

const result = await response.json();
```

### snake_case → camelCase Mapping

Backend returns:
```json
{
  "player_id": 123,
  "player_name": "John",
  "registered_at": "2026-01-06..."
}
```

Frontend maps to:
```typescript
{
  playerId: 123,
  playerName: "John",
  registeredAt: "2026-01-06..."
}
```

**Example**:
```typescript
const data = await response.json();
const participant = {
  id: data.id,
  playerId: data.player_id,
  playerName: data.player_name,
  rating: data.rating,
  status: data.status,
  seed: data.seed,
  registeredAt: data.registered_at,
  confirmedAt: data.confirmed_at,
  registeredByAdmin: data.registered_by_admin
};
```

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For production (Vercel):
```
NEXT_PUBLIC_API_URL=https://your-backend.herokuapp.com
```

---

## Build & Deploy

### Development
```bash
cd frontend
npm install
npm run dev
# Opens on http://localhost:3000
```

### Production Build
```bash
npm run build
npm start
```

### Vercel Deployment
- Connected to GitHub
- Auto-deploys on push to main/dev
- Environment variables set in Vercel dashboard

---

## Responsive Design

- Mobile-first approach
- Breakpoints: sm, md, lg, xl (Tailwind)
- Modals use `max-w-2xl` + `p-4` for mobile
- Tables scroll horizontally on small screens
- Navigation collapses to hamburger menu

---

## Performance Optimizations

- Server Components for static content
- Client Components only where needed
- No unnecessary re-renders
- Fetch data on server when possible
- Images optimized (Next.js Image component)

---

## Common Patterns

### Fetching Data
```typescript
useEffect(() => {
  fetchData();
}, [dependency]);

const fetchData = async () => {
  try {
    setLoading(true);
    const response = await fetch(url);
    const data = await response.json();
    setData(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### Error Handling
```typescript
try {
  await apiCall();
  setSuccess('Operation successful');
  setTimeout(() => setSuccess(''), 3000);
} catch (err: any) {
  setError(err.message);
}
```

### Conditional Rendering
```typescript
{loading && <div>Loading...</div>}
{error && <div className="text-red-600">{error}</div>}
{data && <Component data={data} />}
```

---

## Accessibility

- Semantic HTML (buttons, forms)
- ARIA labels where needed
- Keyboard navigation support
- Focus states visible
- Error messages readable

---

## Future Improvements

- Add React Query for caching
- Implement optimistic UI updates
- Add loading skeletons
- Improve error boundaries
- Add animations (Framer Motion)
- PWA support
