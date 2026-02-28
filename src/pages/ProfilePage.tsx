import { useEffect, useState } from 'react';
import { LogOut, Bell, Trophy } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { matches, type Match1v1, type Profile } from '@/lib/db';
import { getInitials } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';

export default function ProfilePage({ onLogout }: { onLogout: () => void }) {
  const { profile } = useAuth();
  const [notifs, setNotifs] = useState({ checkins: true, reminders: true, tournaments: true });
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);

  useEffect(() => {
    if (!profile) return;
    matches.getRecent(100).then(ms => {
      setWins(ms.filter(m => m.winner_id === profile.user_id && m.status === 'confirmed').length);
      setLosses(ms.filter(m => m.loser_id === profile.user_id && m.status === 'confirmed').length);
    }).catch(() => {});
  }, [profile]);

  if (!profile) return null;

  return (
    <div className="p-4 space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-court text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-4">
          {getInitials(profile.name)}
        </div>
        <h2 className="font-display text-xl font-bold">{profile.name}</h2>
        {profile.handle && <p className="text-sm text-muted-foreground">@{profile.handle}</p>}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="text-center">
            <span className="font-display font-bold text-lg text-primary">{profile.rating}</span>
            <p className="text-[10px] text-muted-foreground uppercase">ELO</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <span className="font-display font-bold text-lg" style={{ color: 'hsl(142 71% 45%)' }}>{wins}</span>
            <p className="text-[10px] text-muted-foreground uppercase">Wins</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <span className="font-display font-bold text-lg text-destructive">{losses}</span>
            <p className="text-[10px] text-muted-foreground uppercase">Losses</p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 shadow-card">
        <h3 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          Notifications
        </h3>
        <div className="space-y-3">
          {[
            { key: 'checkins' as const, label: 'Friend check-ins' },
            { key: 'reminders' as const, label: 'Plan reminders' },
            { key: 'tournaments' as const, label: 'New runs & tournaments' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <span className="text-sm">{item.label}</span>
              <button onClick={() => setNotifs(prev => ({ ...prev, [item.key]: !prev[item.key] }))} className={`w-10 h-6 rounded-full transition-colors relative ${notifs[item.key] ? 'bg-primary' : 'bg-secondary'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full transition-transform ${notifs[item.key] ? 'translate-x-5 bg-primary-foreground' : 'translate-x-1 bg-muted-foreground'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 shadow-card">
        <h3 className="font-display font-semibold text-sm mb-2">Coming Soon</h3>
        <ul className="space-y-1.5 text-xs text-muted-foreground">
          <li>📹 Video upload + AI box score extraction</li>
          <li>🏀 Multi-court support</li>
          <li>📱 Push notifications + SMS</li>
          <li>📊 Advanced stats & player profiles</li>
        </ul>
      </div>

      <Button variant="outline" className="w-full border-destructive/30 text-destructive hover:bg-destructive/10" onClick={onLogout}>
        <LogOut className="w-4 h-4 mr-2" />Sign Out
      </Button>
    </div>
  );
}
