import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Swords, Bell, CheckCheck } from 'lucide-react';
import { notifications, type Notification } from '@/lib/db';
import { useAuth } from '@/lib/auth-context';
import { timeAgo } from '@/lib/mock-data';

export default function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!userId) return;
    try {
      const data = await notifications.getForUser(userId);
      setNotifs(data);
    } catch (e) {
      console.error('Failed to load notifications', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    if (!userId) return;
    const unsub = notifications.onChanges(userId, () => load());
    return unsub;
  }, [userId]);

  const handleMarkAllRead = async () => {
    if (!userId) return;
    try {
      await notifications.markAllRead(userId);
      await load();
    } catch (e) {
      console.error('Failed to mark all read', e);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notifications.markRead(id);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.error('Failed to mark read', e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute top-14 left-2 right-2 z-50 max-w-lg mx-auto"
    >
      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-display font-semibold text-sm">Notifications</h3>
          <div className="flex items-center gap-2">
            {notifs.some(n => !n.read) && (
              <button onClick={handleMarkAllRead} className="p-1 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground" title="Mark all read">
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
            <button onClick={onClose} className="p-1 hover:bg-secondary rounded-lg">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-6">Loading...</p>
          ) : notifs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No notifications yet</p>
          ) : (
            notifs.map(n => (
              <button
                key={n.id}
                onClick={() => !n.read && handleMarkRead(n.id)}
                className={`w-full flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 text-left transition-colors hover:bg-secondary/50 ${
                  !n.read ? 'bg-primary/5' : ''
                }`}
              >
                <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${!n.read ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                  <Swords className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{timeAgo(n.created_at)}</p>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />}
              </button>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
