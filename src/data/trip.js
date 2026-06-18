// ────────────────────────────────────────────────────────────────
//  ✏️  EDIT YOUR TRIP HERE
//  This is the starting data. Once the site loads you can also add,
//  edit, check off, and delete things right in the browser — your
//  changes are saved automatically (in localStorage).
//  Use the "Reset to defaults" button to come back to this file's data.
// ────────────────────────────────────────────────────────────────

export const tripMeta = {
  title: 'Hard Oncheurs in Japan',
  subtitle: '日本の旅 · Summer 2026',
  // The countdown counts down to this date/time (your departure).
  // Format: YYYY-MM-DDTHH:MM (24h, local time).
  startDate: '2026-07-01T13:30',
  endDate: '2026-07-02T09:10',
}

// The two flights to track. `flightNo` + the date in `depart` are what the
// "Live" button sends to the flight API — the rest (route, times) is just a
// placeholder until you hit refresh, which fills in the real data.
export const flights = [
  {
    id: 'f1',
    airline: 'Air France',
    flightNo: 'AF292',
    from: { code: 'CDG', city: 'Paris' },
    to: { code: 'HND', city: 'Tokyo' },
    depart: '2026-07-01T13:30',
    arrive: '2026-07-02T09:00',
    seat: '',
    status: 'On time', // On time | Boarding | Delayed | Landed | Cancelled
  },
  {
    id: 'f2',
    airline: 'JAL',
    flightNo: 'JL130',
    from: { code: 'ITM', city: 'Osaka' },
    to: { code: 'HND', city: 'Tokyo' },
    depart: '2026-07-02T08:00',
    arrive: '2026-07-02T09:10',
    seat: '',
    status: 'On time',
  },
]

export const activities = [
  {
    id: 'a1',
    day: 'Day 1',
    date: '2026-04-04',
    city: 'Tokyo',
    title: 'Shibuya Crossing & Hachiko statue',
    time: '17:00',
    note: 'Sunset at the scramble, then ramen in Shibuya.',
    emoji: '🌆',
    done: false,
  },
  {
    id: 'a2',
    day: 'Day 2',
    date: '2026-04-05',
    city: 'Tokyo',
    title: 'Senso-ji Temple, Asakusa',
    time: '09:30',
    note: 'Nakamise shopping street for snacks & omamori.',
    emoji: '⛩️',
    done: false,
  },
  {
    id: 'a3',
    day: 'Day 3',
    date: '2026-04-06',
    city: 'Tokyo',
    title: 'teamLab Planets',
    time: '13:00',
    note: 'Pre-book tickets! Wear shorts (water rooms).',
    emoji: '🎨',
    done: false,
  },
  {
    id: 'a4',
    day: 'Day 4',
    date: '2026-04-07',
    city: 'Hakone',
    title: 'Hakone day trip & onsen',
    time: '08:00',
    note: 'Pirate ship on Lake Ashi, views of Mt. Fuji.',
    emoji: '🗻',
    done: false,
  },
  {
    id: 'a5',
    day: 'Day 7',
    date: '2026-04-10',
    city: 'Osaka',
    title: 'Dotonbori food crawl',
    time: '19:00',
    note: 'Takoyaki, okonomiyaki, Glico sign photo.',
    emoji: '🐙',
    done: false,
  },
  {
    id: 'a6',
    day: 'Day 9',
    date: '2026-04-12',
    city: 'Kyoto',
    title: 'Fushimi Inari Taisha',
    time: '07:30',
    note: 'Go early to beat crowds at the torii gates.',
    emoji: '🦊',
    done: false,
  },
  {
    id: 'a7',
    day: 'Day 10',
    date: '2026-04-13',
    city: 'Kyoto',
    title: 'Arashiyama Bamboo Grove',
    time: '08:00',
    note: 'Then Tenryu-ji temple & monkey park.',
    emoji: '🎋',
    done: false,
  },
  {
    id: 'a8',
    day: 'Day 12',
    date: '2026-04-15',
    city: 'Nara',
    title: 'Nara Park deer & Todai-ji',
    time: '10:00',
    note: 'Buy shika senbei to feed the bowing deer.',
    emoji: '🦌',
    done: false,
  },
]

// Photos and YouTube videos you add in the browser are stored here.
export const gallery = []

export const defaultTrip = { tripMeta, flights, activities, gallery }
