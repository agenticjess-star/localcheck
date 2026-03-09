import { useEffect, useState } from 'react';
import { LogOut, Bell, MapPin, Map } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { matches, courts, profiles, type Court } from '@/lib/db';
import { getInitials } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import CourtMap from '@/components/CourtMap';
import { toast } from 'sonner';

export default function ProfilePage({ onLogout }: { onLogout: () => void }) {
  const { profile, session, refreshProfile } = useAuth();
  const userId = session?.user?.id;
  const [notifs, setNotifs] = useState({ checkins: true, reminders: true, tournaments: true });
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [localCourt, setLocalCourt] = useState<Court | null>(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (!profile) return;
    matches.getRecent(100).then(ms => {
      setWins(ms.filter(m => m.winner_id === profile.user_id && m.status === 'confirmed').length);
      setLosses(ms.filter(m => m.loser_id === profile.user_id && m.status === 'confirmed').length);
    }).catch(() => {});
  }, [profile]);

  useEffect(() => {
    if (!profile?.local_court_id) { setLocalCourt(null); return; }
    courts.getAll().then(all => {
      setLocalCourt(all.find(c => c.id === profile.local_court_id) ?? null);
    }).catch(() => {});
  }, [profile?.local_court_id]);

  const handleSelectCourt = async (court: Court) => {
    if (!userId) return;
    try {
      await profiles.update(userId, { local_court_id: court.id });
      await refreshProfile();
      toast.success(`${court.name} set as your local court!`);
      setShowMap(false);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to set court');
    }
  };

  if (!profile) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-muted-foreground py-6">Loading profile...</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 space-y-6 max-w-lg mx-auto">
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
              <span className="font-display font-bold text-lg text-court-green">{wins}</span>
              <p className="text-[10px] text-muted-foreground uppercase">Wins</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <span className="font-display font-bold text-lg text-destructive">{losses}</span>
              <p className="text-[10px] text-muted-foreground uppercase">Losses</p>
            </div>
          </div>
        </div>

        {/* Local Court */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-card">
          <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Local Court
          </h3>
          {localCourt ? (
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{localCourt.name}</p>
                <p className="text-xs text-muted-foreground truncate">{localCourt.address}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setShowMap(true)} className="shrink-0 ml-3">
                <Map className="w-3.5 h-3.5 mr-1" />Change
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setShowMap(true)} className="w-full border-dashed border-primary/30 text-primary hover:bg-primary/10">
              <Map className="w-4 h-4 mr-2" />
              Set Your Local Court
            </Button>
          )}
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

        <Button variant="outline" className="w-full border-destructive/30 text-destructive hover:bg-destructive/10" onClick={onLogout}>
          <LogOut className="w-4 h-4 mr-2" />Sign Out
        </Button>
      </div>

      <AnimatePresence>
        {showMap && <CourtMap onClose={() => setShowMap(false)} onSelectCourt={handleSelectCourt} />}
      </AnimatePresence>
    </>
  );
}
