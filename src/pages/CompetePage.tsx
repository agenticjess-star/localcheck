import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Swords, Plus, Check, Clock, TrendingUp } from 'lucide-react';
import { DEMO_USERS, DEMO_MATCHES, getUserById, getInitials, timeAgo } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';

export default function CompetePage() {
  const [tab, setTab] = useState<'leaderboard' | 'matches'>('leaderboard');
  const [showLog, setShowLog] = useState(false);

  const rankedUsers = [...DEMO_USERS].sort((a, b) => b.rating - a.rating);

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Compete</h2>
        <Button
          size="sm"
          onClick={() => setShowLog(!showLog)}
          className="bg-gradient-court text-primary-foreground hover:opacity-90"
        >
          <Swords className="w-4 h-4 mr-1" />
          Log 1v1
        </Button>
      </div>

      {showLog && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-card border border-border rounded-xl p-4 space-y-3 shadow-card"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Winner</label>
              <select className="w-full bg-secondary text-foreground rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                {DEMO_USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Loser</label>
              <select className="w-full bg-secondary text-foreground rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                {DEMO_USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Winner Score</label>
              <input type="number" defaultValue={11} className="w-full bg-secondary text-foreground rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Loser Score</label>
              <input type="number" defaultValue={0} className="w-full bg-secondary text-foreground rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1 bg-gradient-court text-primary-foreground hover:opacity-90">Submit Match</Button>
            <Button variant="outline" onClick={() => setShowLog(false)}>Cancel</Button>
          </div>
        </motion.div>
      )}

      {/* Tab switcher */}
      <div className="flex bg-secondary rounded-xl p-1">
        <button
          onClick={() => setTab('leaderboard')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'leaderboard' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
          }`}
        >
          <Trophy className="w-4 h-4 inline mr-1.5" />
          Leaderboard
        </button>
        <button
          onClick={() => setTab('matches')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'matches' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
          }`}
        >
          <Swords className="w-4 h-4 inline mr-1.5" />
          Recent
        </button>
      </div>

      {tab === 'leaderboard' ? (
        <div className="space-y-2">
          {rankedUsers.map((user, i) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 shadow-card"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                i === 0 ? 'bg-gradient-court text-primary-foreground' :
                i === 1 ? 'bg-secondary text-foreground' :
                i === 2 ? 'bg-secondary text-foreground' :
                'bg-secondary text-muted-foreground'
              }`}>
                {i + 1}
              </div>
              <div className="w-9 h-9 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                {getInitials(user.name)}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm">{user.name}</span>
                <p className="text-xs text-muted-foreground">{user.handle}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="font-display font-bold text-sm text-primary">{user.rating}</span>
                <p className="text-[10px] text-muted-foreground">ELO</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {DEMO_MATCHES.map((match, i) => {
            const winner = getUserById(match.winner_id);
            const loser = getUserById(match.loser_id);
            if (!winner || !loser) return null;
            return (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl px-4 py-3 shadow-card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-court-green/20 text-xs font-bold flex items-center justify-center" style={{ color: 'hsl(142 71% 45%)' }}>
                      {getInitials(winner.name)}
                    </div>
                    <div>
                      <span className="text-sm font-medium">{winner.name}</span>
                      <span className="text-xs text-muted-foreground ml-1">W</span>
                    </div>
                  </div>
                  <span className="font-display font-bold text-lg text-primary">
                    {match.winner_score}–{match.loser_score}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <span className="text-sm font-medium">{loser.name}</span>
                      <span className="text-xs text-muted-foreground ml-1">L</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-destructive/20 text-destructive text-xs font-bold flex items-center justify-center">
                      {getInitials(loser.name)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">{timeAgo(match.created_at)}</span>
                  {match.status === 'pending' ? (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-court-amber/20" style={{ color: 'hsl(38 92% 50%)' }}>
                      <Clock className="w-3 h-3 inline mr-1" />Pending
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-court-green/20" style={{ color: 'hsl(142 71% 45%)' }}>
                      <Check className="w-3 h-3 inline mr-1" />Confirmed
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
