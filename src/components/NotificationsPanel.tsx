import { motion } from 'framer-motion';
import { X, MapPin, Clock, Trophy, Swords } from 'lucide-react';
import { DEMO_NOTIFICATIONS, timeAgo } from '@/lib/mock-data';

const iconMap = {
  checkin: MapPin,
  plan_reminder: Clock,
  tournament: Trophy,
  match: Swords,
};

export default function NotificationsPanel({ onClose }: { onClose: () => void }) {
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
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded-lg">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {DEMO_NOTIFICATIONS.map(n => {
            const Icon = iconMap[n.type];
            return (
              <div
                key={n.id}
                className={`flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 ${
                  !n.read ? 'bg-primary/5' : ''
                }`}
              >
                <div className={`mt-0.5 p-1.5 rounded-lg ${!n.read ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{timeAgo(n.created_at)}</p>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
