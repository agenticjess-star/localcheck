import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Plus, Trash2, Edit2 } from 'lucide-react';
import { DEMO_PLANS, getUserById, formatTime, formatDate, CURRENT_USER } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';

export default function SchedulePage() {
  const [showForm, setShowForm] = useState(false);

  // Group plans by day
  const grouped = DEMO_PLANS.reduce((acc, plan) => {
    const day = formatDate(plan.start_at);
    if (!acc[day]) acc[day] = [];
    acc[day].push(plan);
    return acc;
  }, {} as Record<string, typeof DEMO_PLANS>);

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Schedule</h2>
        <Button
          size="sm"
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-court text-primary-foreground hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-1" />
          I'm Coming
        </Button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-card border border-border rounded-xl p-4 space-y-3 shadow-card"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Date</label>
              <input
                type="date"
                className="w-full bg-secondary text-foreground rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Start Time</label>
              <input
                type="time"
                defaultValue="17:00"
                className="w-full bg-secondary text-foreground rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Duration</label>
            <select className="w-full bg-secondary text-foreground rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option>60 min</option>
              <option selected>90 min</option>
              <option>120 min</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Add a note..."
            className="w-full bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <div className="flex gap-2">
            <Button className="flex-1 bg-gradient-court text-primary-foreground hover:opacity-90">Save Plan</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </motion.div>
      )}

      {/* Weekly view */}
      <div className="space-y-5">
        {Object.entries(grouped).map(([day, plans]) => (
          <div key={day}>
            <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {day}
            </h3>
            <div className="space-y-2">
              {plans.map((plan, i) => {
                const user = getUserById(plan.user_id);
                if (!user) return null;
                const isMe = plan.user_id === CURRENT_USER.id;
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-3 bg-card border rounded-xl px-4 py-3 shadow-card ${
                      isMe ? 'border-primary/30' : 'border-border'
                    }`}
                  >
                    <div className="w-1 h-10 rounded-full bg-gradient-court shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{user.name}</span>
                        {isMe && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary">YOU</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatTime(plan.start_at)} – {formatTime(plan.end_at)}
                        </span>
                      </div>
                      {plan.note && (
                        <p className="text-xs text-primary/70 mt-1">"{plan.note}"</p>
                      )}
                    </div>
                    {isMe && (
                      <div className="flex gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-destructive/20 text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
