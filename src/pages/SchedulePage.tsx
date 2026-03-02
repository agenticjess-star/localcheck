import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { plans, type Plan, type Profile } from '@/lib/db';
import { useAuth } from '@/lib/auth-context';
import { formatTime } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type PlanWithProfile = Plan & { profile: Profile };
type ViewMode = 'day' | 'week' | 'month';

const HOUR_HEIGHT = 48;
const START_HOUR = 6;
const END_HOUR = 23;

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getWeekDays(date: Date): Date[] {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function getMonthDays(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = first.getDay();
  const days: Date[] = [];
  for (let i = -startOffset; i < 42 - startOffset; i++) {
    const d = new Date(year, month, 1 + i);
    days.push(d);
  }
  return days;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function SchedulePage() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [view, setView] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [allPlans, setAllPlans] = useState<PlanWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState('');
  const [time, setTime] = useState('17:00');
  const [duration, setDuration] = useState(90);
  const [note, setNote] = useState('');

  const load = async () => {
    try {
      const p = await plans.getUpcoming();
      setAllPlans(p);
    } catch (e) {
      console.error('Failed to load plans', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const navigate = (dir: -1 | 1) => {
    const d = new Date(currentDate);
    if (view === 'day') d.setDate(d.getDate() + dir);
    else if (view === 'week') d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir);
    setCurrentDate(d);
  };

  const handleCreate = async () => {
    if (!userId || !date) { toast.error('Pick a date first'); return; }
    const start = new Date(`${date}T${time}`);
    const end = new Date(start.getTime() + duration * 60000);
    try {
      await plans.create(userId, start.toISOString(), end.toISOString(), note);
      setShowForm(false); setDate(''); setNote('');
      toast.success('Plan added! 📅');
      await load();
    } catch (e: any) {
      console.error('Failed to create plan', e);
      toast.error(e?.message || 'Failed to save plan');
    }
  };

  const handleDelete = async (planId: string) => {
    try {
      await plans.remove(planId);
      toast.success('Plan removed');
      await load();
    } catch (e: any) {
      console.error('Failed to delete plan', e);
      toast.error(e?.message || 'Failed to delete plan');
    }
  };

  const getPlansForDay = (day: Date) =>
    allPlans.filter(p => isSameDay(new Date(p.start_at), day));

  const today = new Date();

  const headerLabel = view === 'day'
    ? currentDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
    : view === 'week'
    ? (() => {
        const week = getWeekDays(currentDate);
        const s = week[0]; const e = week[6];
        return `${s.toLocaleDateString([], { month: 'short', day: 'numeric' })} – ${e.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
      })()
    : `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Schedule</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="bg-gradient-court text-primary-foreground hover:opacity-90">
          <Plus className="w-4 h-4 mr-1" />I'm Coming
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-card border border-border rounded-xl p-4 space-y-3 shadow-card">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-secondary text-foreground rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Start Time</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-secondary text-foreground rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Duration</label>
            <select value={duration} onChange={e => setDuration(+e.target.value)} className="w-full bg-secondary text-foreground rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value={60}>60 min</option>
              <option value={90}>90 min</option>
              <option value={120}>120 min</option>
            </select>
          </div>
          <input type="text" placeholder="Add a note..." value={note} onChange={e => setNote(e.target.value)} className="w-full bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          <div className="flex gap-2">
            <Button onClick={handleCreate} className="flex-1 bg-gradient-court text-primary-foreground hover:opacity-90">Save Plan</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </motion.div>
      )}

      {/* View toggle + navigation */}
      <div className="flex items-center gap-2">
        <div className="flex bg-secondary rounded-xl p-1 flex-1">
          {(['day', 'week', 'month'] as ViewMode[]).map(v => (
            <button key={v} onClick={() => setView(v)} className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${view === v ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
              {v}
            </button>
          ))}
        </div>
        <button onClick={() => setCurrentDate(new Date())} className="text-xs text-primary font-medium px-2 py-1.5 rounded-lg hover:bg-primary/10">Today</button>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"><ChevronLeft className="w-5 h-5" /></button>
        <span className="font-display font-semibold text-sm">{headerLabel}</span>
        <button onClick={() => navigate(1)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"><ChevronRight className="w-5 h-5" /></button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-6">Loading...</p>
      ) : view === 'month' ? (
        /* Month grid */
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
          <div className="grid grid-cols-7">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-2 border-b border-border">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {getMonthDays(currentDate).map((day, i) => {
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isToday = isSameDay(day, today);
              const dayPlans = getPlansForDay(day);
              return (
                <button
                  key={i}
                  onClick={() => { setCurrentDate(day); setView('day'); }}
                  className={`relative min-h-[52px] p-1 border-b border-r border-border text-left transition-colors hover:bg-secondary/50 ${!isCurrentMonth ? 'opacity-30' : ''}`}
                >
                  <span className={`text-[11px] font-medium block mb-0.5 ${isToday ? 'w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center' : 'text-foreground'}`}>
                    {day.getDate()}
                  </span>
                  {dayPlans.slice(0, 2).map((p, j) => (
                    <div key={j} className="text-[8px] leading-tight truncate px-0.5 py-px rounded bg-primary/15 text-primary mb-0.5">{p.profile?.name?.split(' ')[0]}</div>
                  ))}
                  {dayPlans.length > 2 && <div className="text-[8px] text-muted-foreground">+{dayPlans.length - 2}</div>}
                </button>
              );
            })}
          </div>
        </div>
      ) : view === 'week' ? (
        /* Week view */
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
          <div className="grid grid-cols-7">
            {getWeekDays(currentDate).map((day, i) => {
              const isToday = isSameDay(day, today);
              const dayPlans = getPlansForDay(day);
              return (
                <button
                  key={i}
                  onClick={() => { setCurrentDate(day); setView('day'); }}
                  className="p-2 border-r border-border last:border-r-0 text-center hover:bg-secondary/50 transition-colors"
                >
                  <div className="text-[10px] text-muted-foreground font-medium">{DAY_NAMES[i]}</div>
                  <div className={`text-sm font-bold mt-0.5 ${isToday ? 'w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto' : 'text-foreground'}`}>
                    {day.getDate()}
                  </div>
                  <div className="mt-2 space-y-1">
                    {dayPlans.slice(0, 3).map((p, j) => (
                      <div key={j} className="text-[8px] leading-tight truncate rounded bg-primary/15 text-primary px-1 py-0.5">
                        {formatTime(p.start_at)}
                      </div>
                    ))}
                    {dayPlans.length > 3 && <div className="text-[8px] text-muted-foreground">+{dayPlans.length - 3}</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Day view */
        <div className="space-y-2">
          {getPlansForDay(currentDate).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No plans for this day. Tap "I'm Coming" to add one!</p>
          ) : (
            getPlansForDay(currentDate).map((plan, i) => {
              const isMe = plan.user_id === userId;
              return (
                <motion.div key={plan.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className={`flex items-center gap-3 bg-card border rounded-xl px-4 py-3 shadow-card ${isMe ? 'border-primary/30' : 'border-border'}`}>
                  <div className="w-1 h-10 rounded-full bg-gradient-court shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{plan.profile?.name || 'Unknown'}</span>
                      {isMe && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary">YOU</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{formatTime(plan.start_at)} – {formatTime(plan.end_at)}</span>
                    </div>
                    {plan.note && <p className="text-xs text-primary/70 mt-1">"{plan.note}"</p>}
                  </div>
                  {isMe && (
                    <button onClick={() => handleDelete(plan.id)} className="p-1.5 rounded-lg hover:bg-destructive/20 text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
