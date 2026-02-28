import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Swords, Check, Clock } from 'lucide-react';
import { profiles, matches, type Profile, type Match1v1 } from '@/lib/db';
import { useAuth } from '@/lib/auth-context';
import { getInitials, timeAgo } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';

type MatchWithProfiles = Match1v1 & { winner: Profile; loser: Profile };

export default function CompetePage() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [tab, setTab] = useState<'leaderboard' | 'matches'>('leaderboard');
  const [showLog, setShowLog] = useState(false);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [recentMatches, setRecentMatches] = useState<MatchWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [opponentId, setOpponentId] = useState('');
  const [myScore, setMyScore] = useState(11);
  const [oppScore, setOppScore] = useState(0);
  const [iWon, setIWon] = useState(true);

  const load = async () => {
    try {
      const [p, m] = await Promise.all([profiles.getAll(), matches.getRecent()]);
      setAllProfiles(p);
      setRecentMatches(m);
      if (p.length > 0 && !opponentId) {
        const first = p.find(pr => pr.user_id !== userId);
        if (first) setOpponentId(first.user_id);
      }
    } catch (e) {
      console.error('Failed to load compete data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    if (!userId || !opponentId) return;
    try {
      if (iWon) {
        await matches.create(userId, opponentId, myScore, oppScore);
      } else {
        await matches.create(opponentId, userId, oppScore, myScore);
      }
      setShowLog(false);
      await load();
    } catch (e) {
      console.error('Failed to log match', e);
    }
  };

  const handleConfirm = async (matchId: string) => {
    try {
      await matches.confirm(matchId);
      await load();
    } catch (e) {
      console.error('Failed to confirm match', e);
    }
  };

  const others = allProfiles.filter(p => p.user_id !== userId);

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Compete</h2>
        <Button size="sm" onClick={() => setShowLog(!showLog)} className="bg-gradient-court text-primary-foreground hover:opacity-90">
          <Swords className="w-4 h-4 mr-1" />
          Log 1v1
        </Button>
      </div>

      {showLog && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-card border border-border rounded-xl p-4 space-y-3 shadow-card">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Opponent</label>
            <select value={opponentId} onChange={e => setOpponentId(e.target.value)} className="w-full bg-secondary text-foreground rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
              {others.map(u => <option key={u.user_id} value={u.user_id}>{u.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-muted-foreground">Result:</label>
            <button onClick={() => setIWon(true)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${iWon ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>I Won</button>
            <button onClick={() => setIWon(false)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${!iWon ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>I Lost</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">My Score</label>
              <input type="number" value={myScore} onChange={e => setMyScore(+e.target.value)} className="w-full bg-secondary text-foreground rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Their Score</label>
              <input type="number" value={oppScore} onChange={e => setOppScore(+e.target.value)} className="w-full bg-secondary text-foreground rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSubmit} className="flex-1 bg-gradient-court text-primary-foreground hover:opacity-90">Submit Match</Button>
            <Button variant="outline" onClick={() => setShowLog(false)}>Cancel</Button>
          </div>
        </motion.div>
      )}

      {/* Tab switcher */}
      <div className="flex bg-secondary rounded-xl p-1">
        <button onClick={() => setTab('leaderboard')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'leaderboard' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
          <Trophy className="w-4 h-4 inline mr-1.5" />Leaderboard
        </button>
        <button onClick={() => setTab('matches')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'matches' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
          <Swords className="w-4 h-4 inline mr-1.5" />Recent
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-6">Loading...</p>
      ) : tab === 'leaderboard' ? (
        allProfiles.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No players yet. Sign up and start competing!</p>
        ) : (
          <div className="space-y-2">
            {allProfiles.map((user, i) => (
              <motion.div key={user.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 shadow-card">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${i === 0 ? 'bg-gradient-court text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>{i + 1}</div>
                <div className="w-9 h-9 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0">{getInitials(user.name)}</div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm">{user.name}</span>
                  {user.handle && <p className="text-xs text-muted-foreground">@{user.handle}</p>}
                </div>
                <div className="text-right shrink-0">
                  <span className="font-display font-bold text-sm text-primary">{user.rating}</span>
                  <p className="text-[10px] text-muted-foreground">ELO</p>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : recentMatches.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No matches yet. Log your first 1v1!</p>
      ) : (
        <div className="space-y-2">
          {recentMatches.map((match, i) => (
            <motion.div key={match.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="bg-card border border-border rounded-xl px-4 py-3 shadow-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-court-green/20 text-xs font-bold flex items-center justify-center" style={{ color: 'hsl(142 71% 45%)' }}>{getInitials(match.winner.name)}</div>
                  <div>
                    <span className="text-sm font-medium">{match.winner.name}</span>
                    <span className="text-xs text-muted-foreground ml-1">W</span>
                  </div>
                </div>
                <span className="font-display font-bold text-lg text-primary">{match.winner_score}–{match.loser_score}</span>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-sm font-medium">{match.loser.name}</span>
                    <span className="text-xs text-muted-foreground ml-1">L</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-destructive/20 text-destructive text-xs font-bold flex items-center justify-center">{getInitials(match.loser.name)}</div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">{timeAgo(match.created_at)}</span>
                {match.status === 'pending' ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-court-amber/20" style={{ color: 'hsl(38 92% 50%)' }}>
                      <Clock className="w-3 h-3 inline mr-1" />Pending
                    </span>
                    {match.loser_id === userId && (
                      <Button size="sm" variant="outline" onClick={() => handleConfirm(match.id)} className="h-6 text-[10px] px-2">Confirm</Button>
                    )}
                  </div>
                ) : (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-court-green/20" style={{ color: 'hsl(142 71% 45%)' }}>
                    <Check className="w-3 h-3 inline mr-1" />Confirmed
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
