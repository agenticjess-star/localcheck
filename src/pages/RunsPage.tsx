import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Calendar, Clock, UserPlus, UserMinus, Shuffle } from 'lucide-react';
import { runEvents, profiles as profilesDb, type RunEvent, type RunRSVP, type Profile } from '@/lib/db';
import { useAuth } from '@/lib/auth-context';
import { getInitials, formatDate, formatTime } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';

type RunWithDetails = RunEvent & { rsvps: RunRSVP[]; creator: Profile };

export default function RunsPage() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [showCreate, setShowCreate] = useState(false);
  const [runs, setRuns] = useState<RunWithDetails[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [showTeams, setShowTeams] = useState<string | null>(null);
  const [teamData, setTeamData] = useState<{ team1: Profile[]; team2: Profile[] } | null>(null);
  const [loading, setLoading] = useState(true);

  // Form
  const [date, setDate] = useState('');
  const [time, setTime] = useState('18:00');
  const [format, setFormat] = useState('5v5');
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [note, setNote] = useState('');

  const load = async () => {
    try {
      const [r, p] = await Promise.all([runEvents.getUpcoming(), profilesDb.getAll()]);
      setRuns(r);
      setAllProfiles(p);
    } catch (e) {
      console.error('Failed to load runs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!userId || !date) return;
    const startAt = new Date(`${date}T${time}`).toISOString();
    try {
      const run = await runEvents.create(userId, startAt, format, maxPlayers, note);
      await runEvents.join(run.id, userId); // auto-RSVP creator
      setShowCreate(false);
      setDate(''); setNote('');
      await load();
    } catch (e) {
      console.error('Failed to create run', e);
    }
  };

  const handleJoin = async (runId: string) => {
    if (!userId) return;
    try {
      await runEvents.join(runId, userId);
      await load();
    } catch (e) {
      console.error('Failed to join', e);
    }
  };

  const handleLeave = async (runId: string) => {
    if (!userId) return;
    try {
      await runEvents.leave(runId, userId);
      await load();
    } catch (e) {
      console.error('Failed to leave', e);
    }
  };

  const handleTeams = async (runId: string) => {
    if (showTeams === runId) {
      setShowTeams(null);
      setTeamData(null);
      return;
    }
    const rsvpProfiles = await runEvents.getRsvpProfiles(runId);
    const sorted = [...rsvpProfiles].sort((a, b) => b.rating - a.rating);
    const t1: Profile[] = [];
    const t2: Profile[] = [];
    sorted.forEach((p, i) => {
      const round = Math.floor(i / 2);
      if (round % 2 === 0) {
        (i % 2 === 0 ? t1 : t2).push(p);
      } else {
        (i % 2 === 0 ? t2 : t1).push(p);
      }
    });
    setTeamData({ team1: t1, team2: t2 });
    setShowTeams(runId);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Runs</h2>
        <Button size="sm" onClick={() => setShowCreate(!showCreate)} className="bg-gradient-court text-primary-foreground hover:opacity-90">
          <Plus className="w-4 h-4 mr-1" />
          Create Run
        </Button>
      </div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-card border border-border rounded-xl p-4 space-y-3 shadow-card">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-secondary text-foreground rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Time</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-secondary text-foreground rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Format</label>
              <select value={format} onChange={e => setFormat(e.target.value)} className="w-full bg-secondary text-foreground rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option>3v3</option><option>4v4</option><option>5v5</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Max Players</label>
              <input type="number" value={maxPlayers} onChange={e => setMaxPlayers(+e.target.value)} className="w-full bg-secondary text-foreground rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>
          <input type="text" placeholder="Add a note..." value={note} onChange={e => setNote(e.target.value)} className="w-full bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          <div className="flex gap-2">
            <Button onClick={handleCreate} className="flex-1 bg-gradient-court text-primary-foreground hover:opacity-90">Create</Button>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-6">Loading...</p>
      ) : runs.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No upcoming runs. Create one!</p>
      ) : (
        <div className="space-y-4">
          {runs.map((run, i) => {
            const iJoined = run.rsvps.some(r => r.user_id === userId);
            const rsvpProfiles = run.rsvps.map(r => allProfiles.find(p => p.user_id === r.user_id)).filter(Boolean) as Profile[];

            return (
              <motion.div key={run.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary">{run.format}</span>
                        <span className="text-xs text-muted-foreground">by {run.creator.name}</span>
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

                  {run.note && <p className="text-sm text-foreground/80 mb-3">"{run.note}"</p>}

                  <div className="flex items-center gap-1 mb-3">
                    {rsvpProfiles.slice(0, 6).map(u => (
                      <div key={u.user_id} className="w-7 h-7 -ml-1 first:ml-0 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center border-2 border-card">
                        {getInitials(u.name)}
                      </div>
                    ))}
                    {rsvpProfiles.length > 6 && <span className="text-xs text-muted-foreground ml-1">+{rsvpProfiles.length - 6}</span>}
                  </div>

                  <div className="flex gap-2">
                    {iJoined ? (
                      <Button size="sm" variant="outline" onClick={() => handleLeave(run.id)} className="flex-1 border-destructive/30 text-destructive">
                        <UserMinus className="w-4 h-4 mr-1" />Leave
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => handleJoin(run.id)} className="flex-1 bg-gradient-court text-primary-foreground hover:opacity-90" disabled={run.rsvps.length >= run.max_players}>
                        <UserPlus className="w-4 h-4 mr-1" />{run.rsvps.length >= run.max_players ? 'Full' : 'Join'}
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleTeams(run.id)}>
                      <Shuffle className="w-4 h-4 mr-1" />Teams
                    </Button>
                  </div>
                </div>

                {showTeams === run.id && teamData && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="border-t border-border p-4">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Auto-Generated Teams</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-secondary rounded-lg p-3">
                        <h5 className="text-xs font-bold text-primary mb-2">Team A</h5>
                        {teamData.team1.map(p => (
                          <div key={p.user_id} className="flex items-center gap-2 py-1">
                            <div className="w-6 h-6 rounded-full bg-primary/15 text-primary text-[9px] font-bold flex items-center justify-center">{getInitials(p.name)}</div>
                            <span className="text-xs">{p.name.split(' ')[0]}</span>
                            <span className="text-[10px] text-muted-foreground ml-auto">{p.rating}</span>
                          </div>
                        ))}
                      </div>
                      <div className="bg-secondary rounded-lg p-3">
                        <h5 className="text-xs font-bold text-court-amber mb-2">Team B</h5>
                        {teamData.team2.map(p => (
                          <div key={p.user_id} className="flex items-center gap-2 py-1">
                            <div className="w-6 h-6 rounded-full bg-court-amber/15 text-court-amber text-[9px] font-bold flex items-center justify-center">{getInitials(p.name)}</div>
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
      )}
    </div>
  );
}
