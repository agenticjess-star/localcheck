import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Plus, Trash2 } from 'lucide-react';
import { plans, type Plan, type Profile } from '@/lib/db';
import { useAuth } from '@/lib/auth-context';
import { formatTime, formatDate } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type PlanWithProfile = Plan & { profile: Profile };

export default function SchedulePage() {
  const { session } = useAuth();
  const userId = session?.user?.id;
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

  const handleCreate = async () => {
    if (!userId || !date) {
      toast.error('Pick a date first');
      return;
    }
    const start = new Date(`${date}T${time}`);
    const end = new Date(start.getTime() + duration * 60000);
    try {
      await plans.create(userId, start.toISOString(), end.toISOString(), note);
      setShowForm(false);
      setDate(''); setNote('');
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

  const grouped = allPlans.reduce((acc, plan) => {
    const day = formatDate(plan.start_at);
    if (!acc[day]) acc[day] = [];
    acc[day].push(plan);
    return acc;
  }, {} as Record<string, PlanWithProfile[]>);

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Schedule</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="bg-gradient-court text-primary-foreground hover:opacity-90">
          <Plus className="w-4 h-4 mr-1" />
          I'm Coming
        </Button>
      </div>

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

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-6">Loading...</p>
      ) : Object.keys(grouped).length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No upcoming plans. Be the first to schedule!</p>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([day, dayPlans]) => (
            <div key={day}>
              <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {day}
              </h3>
              <div className="space-y-2">
                {dayPlans.map((plan, i) => {
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
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
