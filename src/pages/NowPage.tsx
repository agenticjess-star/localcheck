import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MapPin, MessageCircle, Users } from 'lucide-react';
import { checkIns, type CheckIn, type Profile } from '@/lib/db';
import { useAuth } from '@/lib/auth-context';
import { getInitials, timeAgo } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type CheckInWithProfile = CheckIn & { profile: Profile };

export default function NowPage() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [activeCheckins, setActiveCheckins] = useState<CheckInWithProfile[]>([]);
  const [myCheckin, setMyCheckin] = useState<CheckIn | null>(null);
  const [note, setNote] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const cis = await checkIns.getActive();
      setActiveCheckins(cis);
      if (userId) {
        const mine = await checkIns.getActiveForUser(userId);
        setMyCheckin(mine);
      }
    } catch (e) {
      console.error('Failed to load check-ins', e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
    const unsub = checkIns.onChanges(() => load());
    return unsub;
  }, [load]);

  const handleCheckIn = async () => {
    if (!userId) return;
    try {
      await checkIns.create(userId, note);
      setShowForm(false);
      setNote('');
      toast.success("You're checked in! 🏀");
      await load();
    } catch (e: any) {
      console.error('Check-in failed', e);
      toast.error(e?.message || 'Check-in failed. Try again.');
    }
  };

  const handleCheckOut = async () => {
    if (!userId) return;
    try {
      await checkIns.remove(userId);
      toast.success('Checked out');
      await load();
    } catch (e: any) {
      console.error('Check-out failed', e);
      toast.error(e?.message || 'Check-out failed. Try again.');
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Court status */}
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-5 shadow-card">
        <div className="absolute inset-0 court-pattern opacity-50" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">My Court</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold text-gradient-court">{activeCheckins.length}</h2>
              <p className="text-sm text-muted-foreground mt-1">people at the court right now</p>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-court-green/20 border border-court-green/30">
              <div className="w-2 h-2 rounded-full bg-court-green animate-pulse-glow" />
              <span className="text-xs font-medium text-court-green">
                {activeCheckins.length > 0 ? 'Active' : 'Empty'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Check-in button */}
      {!myCheckin ? (
        !showForm ? (
          <Button
            onClick={() => setShowForm(true)}
            className="w-full h-14 text-base font-semibold bg-gradient-court text-primary-foreground hover:opacity-90 shadow-glow rounded-xl"
          >
            <MapPin className="w-5 h-5 mr-2" />
            I'm Here
          </Button>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-card border border-border rounded-xl p-4 space-y-3 shadow-card"
          >
            <input
              type="text"
              placeholder="Add a note... (e.g., 'Running 5s', 'Need 2')"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <div className="flex gap-2">
              <Button onClick={handleCheckIn} className="flex-1 bg-gradient-court text-primary-foreground hover:opacity-90">
                Check In
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </motion.div>
        )
      ) : (
        <div className="bg-card border border-primary/30 rounded-xl p-4 flex items-center justify-between shadow-glow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium">You're checked in!</p>
              <p className="text-xs text-muted-foreground">Auto-expires in 2 hours</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleCheckOut} className="border-primary/30 text-primary hover:bg-primary/10">
            Check Out
          </Button>
        </div>
      )}

      {/* Who's here */}
      <div>
        <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Who's Here
        </h3>
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-6">Loading...</p>
        ) : activeCheckins.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No one's here yet. Be the first!</p>
        ) : (
          <div className="space-y-2">
            {activeCheckins.map((ci, i) => (
              <motion.div
                key={ci.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 shadow-card"
              >
                <div className="w-10 h-10 rounded-full bg-primary/15 text-primary text-sm font-bold flex items-center justify-center shrink-0">
                  {getInitials(ci.profile?.name || '?')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{ci.profile?.name || 'Unknown'}</span>
                    {ci.profile?.handle && <span className="text-xs text-muted-foreground">@{ci.profile.handle}</span>}
                  </div>
                  {ci.note && (
                    <p className="text-xs text-primary/80 mt-0.5 flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {ci.note}
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{timeAgo(ci.created_at)}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
