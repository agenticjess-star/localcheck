import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Calendar, Clock, UserPlus, Shuffle, ChevronRight } from 'lucide-react';
import { DEMO_RUNS, DEMO_USERS, getUserById, getInitials, formatDate, formatTime } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';

export default function RunsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [showTeams, setShowTeams] = useState<string | null>(null);

  const generateTeams = (rsvps: string[]) => {
    const players = rsvps.map(id => getUserById(id)).filter(Boolean).sort((a, b) => b!.rating - a!.rating);
    const team1: typeof players = [];
    const team2: typeof players = [];
    // Snake draft
    players.forEach((p, i) => {
      const round = Math.floor(i / 2);
      if (round % 2 === 0) {
        (i % 2 === 0 ? team1 : team2).push(p);
      } else {
        (i % 2 === 0 ? team2 : team1).push(p);
      }
    });
    return { team1, team2 };
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Runs</h2>
        <Button
          size="sm"
          onClick={() => setShowCreate(!showCreate)}
          className="bg-gradient-court text-primary-foreground hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-1" />
          Create Run
        </Button>
      </div>

      {showCreate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-card border border-border rounded-xl p-4 space-y-3 shadow-card"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Date</label>
              <input type="date" className="w-full bg-secondary text-foreground rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Time</label>
              <input type="time" defaultValue="18:00" className="w-full bg-secondary text-foreground rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Format</label>
              <select className="w-full bg-secondary text-foreground rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option>3v3</option>
                <option>4v4</option>
                <option selected>5v5</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Max Players</label>
              <input type="number" defaultValue={10} className="w-full bg-secondary text-foreground rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>
          <input type="text" placeholder="Add a note..." className="w-full bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          <div className="flex gap-2">
            <Button className="flex-1 bg-gradient-court text-primary-foreground hover:opacity-90">Create</Button>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </motion.div>
      )}

      {/* Runs list */}
      <div className="space-y-4">
        {DEMO_RUNS.map((run, i) => {
          const creator = getUserById(run.created_by);
          const teams = showTeams === run.id ? generateTeams(run.rsvps) : null;

          return (
            <motion.div
              key={run.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-xl overflow-hidden shadow-card"
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary">{run.format}</span>
                      <span className="text-xs text-muted-foreground">by {creator?.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(run.start_at)}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatTime(run.start_at)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-display font-bold text-lg text-primary">{run.rsvps.length}</span>
                    <span className="text-xs text-muted-foreground">/{run.max_players}</span>
                  </div>
                </div>

                {run.note && (
                  <p className="text-sm text-foreground/80 mb-3">"{run.note}"</p>
                )}

                {/* RSVP avatars */}
                <div className="flex items-center gap-1 mb-3">
                  {run.rsvps.slice(0, 6).map(uid => {
                    const u = getUserById(uid);
                    return u ? (
                      <div key={uid} className="w-7 h-7 -ml-1 first:ml-0 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center border-2 border-card">
                        {getInitials(u.name)}
                      </div>
                    ) : null;
                  })}
                  {run.rsvps.length > 6 && (
                    <span className="text-xs text-muted-foreground ml-1">+{run.rsvps.length - 6}</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-gradient-court text-primary-foreground hover:opacity-90">
                    <UserPlus className="w-4 h-4 mr-1" />
                    Join
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowTeams(showTeams === run.id ? null : run.id)}
                  >
                    <Shuffle className="w-4 h-4 mr-1" />
                    Teams
                  </Button>
                </div>
              </div>

              {/* Generated teams */}
              {teams && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="border-t border-border p-4"
                >
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Auto-Generated Teams</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-secondary rounded-lg p-3">
                      <h5 className="text-xs font-bold text-primary mb-2">Team A</h5>
                      {teams.team1.map(p => p && (
                        <div key={p.id} className="flex items-center gap-2 py-1">
                          <div className="w-6 h-6 rounded-full bg-primary/15 text-primary text-[9px] font-bold flex items-center justify-center">
                            {getInitials(p.name)}
                          </div>
                          <span className="text-xs">{p.name.split(' ')[0]}</span>
                          <span className="text-[10px] text-muted-foreground ml-auto">{p.rating}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-secondary rounded-lg p-3">
                      <h5 className="text-xs font-bold text-court-amber mb-2">Team B</h5>
                      {teams.team2.map(p => p && (
                        <div key={p.id} className="flex items-center gap-2 py-1">
                          <div className="w-6 h-6 rounded-full bg-court-amber/15 text-court-amber text-[9px] font-bold flex items-center justify-center">
                            {getInitials(p.name)}
                          </div>
                          <span className="text-xs">{p.name.split(' ')[0]}</span>
                          <span className="text-[10px] text-muted-foreground ml-auto">{p.rating}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
