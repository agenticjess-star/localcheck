// Demo data for CourtCheck MVP

export interface User {
  id: string;
  name: string;
  handle: string;
  avatar_url: string;
  rating: number;
}

export interface CheckIn {
  id: string;
  user_id: string;
  court_id: string;
  note: string;
  created_at: string;
  expires_at: string;
}

export interface Plan {
  id: string;
  user_id: string;
  court_id: string;
  start_at: string;
  end_at: string;
  note: string;
}

export interface Match1v1 {
  id: string;
  court_id: string;
  winner_id: string;
  loser_id: string;
  winner_score: number;
  loser_score: number;
  status: 'pending' | 'confirmed';
  created_at: string;
}

export interface RunEvent {
  id: string;
  court_id: string;
  start_at: string;
  format: string;
  max_players: number;
  note: string;
  created_by: string;
  rsvps: string[];
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'checkin' | 'plan_reminder' | 'tournament' | 'match';
  message: string;
  created_at: string;
  read: boolean;
}

const now = new Date();
const h = (hours: number) => {
  const d = new Date(now);
  d.setHours(d.getHours() + hours);
  return d.toISOString();
};
const daysFromNow = (days: number, hour: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

export const DEMO_USERS: User[] = [
  { id: 'u1', name: 'Marcus Johnson', handle: '@buckets', avatar_url: '', rating: 1245 },
  { id: 'u2', name: 'DeShawn Williams', handle: '@swish', avatar_url: '', rating: 1180 },
  { id: 'u3', name: 'Alex Rivera', handle: '@crossover', avatar_url: '', rating: 1120 },
  { id: 'u4', name: 'Jordan Chen', handle: '@jchen', avatar_url: '', rating: 1090 },
  { id: 'u5', name: 'Tyler Brooks', handle: '@tbrooks', avatar_url: '', rating: 1060 },
  { id: 'u6', name: 'Kai Nakamura', handle: '@kai_ball', avatar_url: '', rating: 1035 },
  { id: 'u7', name: 'Chris Parker', handle: '@cp3jr', avatar_url: '', rating: 1010 },
  { id: 'u8', name: 'Manny Ortiz', handle: '@manny_o', avatar_url: '', rating: 985 },
  { id: 'u9', name: 'Jamal Davis', handle: '@jdavis', avatar_url: '', rating: 970 },
  { id: 'u10', name: 'Ryan Kim', handle: '@rkim', avatar_url: '', rating: 950 },
];

export const CURRENT_USER = DEMO_USERS[0];

export const DEMO_CHECKINS: CheckIn[] = [
  { id: 'c1', user_id: 'u2', court_id: 'court1', note: 'Running 5s, need 2 more', created_at: h(-0.5), expires_at: h(1.5) },
  { id: 'c2', user_id: 'u3', court_id: 'court1', note: 'Shooting around', created_at: h(-0.3), expires_at: h(1.7) },
  { id: 'c3', user_id: 'u6', court_id: 'court1', note: '', created_at: h(-1), expires_at: h(1) },
  { id: 'c4', user_id: 'u7', court_id: 'court1', note: 'Got next', created_at: h(-0.1), expires_at: h(1.9) },
];

export const DEMO_PLANS: Plan[] = [
  { id: 'p1', user_id: 'u1', court_id: 'court1', start_at: daysFromNow(0, 17), end_at: daysFromNow(0, 18.5), note: 'After work session' },
  { id: 'p2', user_id: 'u2', court_id: 'court1', start_at: daysFromNow(0, 16), end_at: daysFromNow(0, 18), note: 'Running 5s' },
  { id: 'p3', user_id: 'u4', court_id: 'court1', start_at: daysFromNow(1, 10), end_at: daysFromNow(1, 12), note: 'Morning run' },
  { id: 'p4', user_id: 'u5', court_id: 'court1', start_at: daysFromNow(1, 17), end_at: daysFromNow(1, 19), note: '' },
  { id: 'p5', user_id: 'u3', court_id: 'court1', start_at: daysFromNow(2, 18), end_at: daysFromNow(2, 20), note: 'Who wants to run?' },
  { id: 'p6', user_id: 'u8', court_id: 'court1', start_at: daysFromNow(3, 16), end_at: daysFromNow(3, 18), note: '3v3' },
  { id: 'p7', user_id: 'u1', court_id: 'court1', start_at: daysFromNow(4, 17), end_at: daysFromNow(4, 19), note: 'Usual time' },
];

export const DEMO_MATCHES: Match1v1[] = [
  { id: 'm1', court_id: 'court1', winner_id: 'u1', loser_id: 'u2', winner_score: 11, loser_score: 7, status: 'confirmed', created_at: h(-24) },
  { id: 'm2', court_id: 'court1', winner_id: 'u2', loser_id: 'u3', winner_score: 11, loser_score: 9, status: 'confirmed', created_at: h(-48) },
  { id: 'm3', court_id: 'court1', winner_id: 'u1', loser_id: 'u4', winner_score: 11, loser_score: 5, status: 'confirmed', created_at: h(-72) },
  { id: 'm4', court_id: 'court1', winner_id: 'u3', loser_id: 'u5', winner_score: 11, loser_score: 8, status: 'confirmed', created_at: h(-96) },
  { id: 'm5', court_id: 'court1', winner_id: 'u6', loser_id: 'u1', winner_score: 11, loser_score: 10, status: 'pending', created_at: h(-2) },
];

export const DEMO_RUNS: RunEvent[] = [
  {
    id: 'r1', court_id: 'court1', start_at: daysFromNow(1, 18), format: '5v5',
    max_players: 10, note: 'Friday night runs! Bring water.', created_by: 'u1',
    rsvps: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7'],
  },
  {
    id: 'r2', court_id: 'court1', start_at: daysFromNow(3, 10), format: '3v3',
    max_players: 6, note: 'Sunday morning 3s', created_by: 'u2',
    rsvps: ['u2', 'u4', 'u8'],
  },
];

export const DEMO_NOTIFICATIONS: Notification[] = [
  { id: 'n1', user_id: 'u1', type: 'checkin', message: 'DeShawn just checked in — "Running 5s, need 2 more"', created_at: h(-0.5), read: false },
  { id: 'n2', user_id: 'u1', type: 'plan_reminder', message: 'Your session starts in 30 minutes', created_at: h(-0.5), read: false },
  { id: 'n3', user_id: 'u1', type: 'tournament', message: 'New run created: "Friday night runs!"', created_at: h(-6), read: true },
  { id: 'n4', user_id: 'u1', type: 'match', message: 'Kai logged a 1v1 match vs you — confirm?', created_at: h(-2), read: false },
];

export function getUserById(id: string): User | undefined {
  return DEMO_USERS.find(u => u.id === id);
}

export function getInitials(name?: string | null): string {
  const safeName = (name ?? '').trim();
  if (!safeName) return '?';

  const initials = safeName
    .split(/\s+/)
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return initials || '?';
}

export function timeAgo(dateStr: string): string {
  const timestamp = new Date(dateStr).getTime();
  if (Number.isNaN(timestamp)) return '';

  const diff = (Date.now() - timestamp) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return 'TBD';

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}
