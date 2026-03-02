import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Swords, Check, AlertTriangle } from 'lucide-react';
import { profiles, matches, type Profile, type Match1v1 } from '@/lib/db';
import { useAuth } from '@/lib/auth-context';
import { getInitials, timeAgo } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type MatchWithProfiles = Match1v1 & { winner: Profile; loser: Profile };

export default function CompetePage() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [tab, setTab] = useState<'leaderboard' | 'matches'>('leaderboard');
  const [showLog, setShowLog] = useState(false);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [recentMatches, setRecentMatches] = useState<MatchWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [opponentId, setOpponentId] = useState('');
  const [myScore, setMyScore] = useState(11);
  const [oppScore, setOppScore] = useState(0);
  const [iWon, setIWon] = useState(true);

  const load = useCallback(async () => {
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
  }, [userId, opponentId]);

  useEffect(() => {
    load();
    const unsub = matches.onChanges(() => load());
    return unsub;
  }, [load]);

  const handleSubmit = async () => {
    if (!userId || !opponentId) return;
    if (userId === opponentId) {
      toast.error("Can't play yourself!");
      return;
    }
    setSubmitting(true);
    try {
      const winnerId = iWon ? userId : opponentId;
      const loserId = iWon ? opponentId : userId;
      const wScore = iWon ? myScore : oppScore;
      const lScore = iWon ? oppScore : myScore;
      await matches.create(winnerId, loserId, wScore, lScore);
      setShowLog(false);
      toast.success('Match logged! Elo updated. 🏀');
      await load();
    } catch (e: any) {
      console.error('Failed to log match', e);
      toast.error(e?.message || 'Failed to log match');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDispute = async (matchId: string) => {
    try {
      await matches.dispute(matchId);
      toast.success('Match disputed — ratings reversed');
      await load();
    } catch (e: any) {
      console.error('Failed to dispute match', e);
      toast.error(e?.message || 'Failed to dispute');
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
            {others.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">No other players yet. Invite someone!</p>
            ) : (
              <select value={opponentId} onChange={e => setOpponentId(e.target.value)} className="w-full bg-secondary text-foreground rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                {others.map(u => <option key={u.user_id} value={u.user_id}>{u.name}</option>)}
              </select>
            )}
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-muted-foreground">Result:</label>
            <button onClick={() => setIWon(true)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${iWon ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>I Won</button>
            <button onClick={() => setIWon(false)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!iWon ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>I Lost</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">My Score</label>
              <input type="number" min={0} value={myScore} onChange={e => setMyScore(+e.target.value)} className="w-full bg-secondary text-foreground rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Their Score</label>
              <input type="number" min={0} value={oppScore} onChange={e => setOppScore(+e.target.value)} className="w-full bg-secondary text-foreground rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={submitting || others.length === 0} className="flex-1 bg-gradient-court text-primary-foreground hover:opacity-90">
              {submitting ? 'Submitting...' : 'Submit Match'}
            </Button>
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
                  <p className="font-medium text-sm truncate">{user.name}</p>
                  {user.handle && <p className="text-xs text-muted-foreground truncate">@{user.handle}</p>}
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className="font-display font-bold text-sm text-primary tabular-nums">{user.rating}</span>
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
          {recentMatches.map((match, i) => {
            const isDisputed = match.status === 'disputed';
            const isParticipant = match.winner_id === userId || match.loser_id === userId;
            const canDispute = isParticipant && !isDisputed;
            return (
              <motion.div key={match.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className={`bg-card border rounded-xl px-4 py-3 shadow-card ${isDisputed ? 'border-accent/30 opacity-60' : 'border-border'}`}>
                <div className="flex items-center">
                  {/* Winner side */}
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-court-green/20 text-court-green text-xs font-bold flex items-center justify-center shrink-0">{getInitials(match.winner?.name || '?')}</div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{match.winner?.name || 'Unknown'}</p>
                      <span className="text-[10px] text-court-green font-medium">W</span>
                    </div>
                  </div>
                  {/* Score */}
                  <div className="font-display font-bold text-xl text-primary shrink-0 px-3 text-center tabular-nums">
                    {match.winner_score}<span className="text-muted-foreground mx-0.5">–</span>{match.loser_score}
                  </div>
                  {/* Loser side */}
                  <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
                    <div className="min-w-0 text-right">
                      <p className="text-sm font-medium truncate">{match.loser?.name || 'Unknown'}</p>
                      <span className="text-[10px] text-destructive font-medium">L</span>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-destructive/20 text-destructive text-xs font-bold flex items-center justify-center shrink-0">{getInitials(match.loser?.name || '?')}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                  <span className="text-[11px] text-muted-foreground">{timeAgo(match.created_at)}</span>
                  <div className="flex items-center gap-1.5">
                    {isDisputed ? (
                      <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-accent/15 text-accent flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />Disputed
                      </span>
                    ) : (
                      <>
                        <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-court-green/20 text-court-green flex items-center gap-1">
                          <Check className="w-3 h-3" />Logged
                        </span>
                        {canDispute && (
                          <Button size="sm" variant="outline" onClick={() => handleDispute(match.id)} className="h-7 text-[10px] px-2.5 border-accent/30 text-accent hover:bg-accent/10">
                            <AlertTriangle className="w-3 h-3 mr-0.5" />Dispute
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
