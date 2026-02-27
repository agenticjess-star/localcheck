import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Trophy, Users, Bell, User, LogOut } from 'lucide-react';
import NowPage from '@/pages/NowPage';
import SchedulePage from '@/pages/SchedulePage';
import CompetePage from '@/pages/CompetePage';
import RunsPage from '@/pages/RunsPage';
import ProfilePage from '@/pages/ProfilePage';
import NotificationsPanel from '@/components/NotificationsPanel';
import { CURRENT_USER, DEMO_NOTIFICATIONS, getInitials } from '@/lib/mock-data';

const tabs = [
  { id: 'now', label: 'Now', icon: MapPin },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'compete', label: 'Compete', icon: Trophy },
  { id: 'runs', label: 'Runs', icon: Users },
] as const;

type TabId = typeof tabs[number]['id'] | 'profile';

export default function AppShell({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<TabId>('now');
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = DEMO_NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="font-display text-lg font-bold text-gradient-court">CourtCheck</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className="w-8 h-8 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center hover:bg-primary/30 transition-colors"
            >
              {getInitials(CURRENT_USER.name)}
            </button>
          </div>
        </div>
      </header>

      {/* Notifications dropdown */}
      <AnimatePresence>
        {showNotifications && (
          <NotificationsPanel onClose={() => setShowNotifications(false)} />
        )}
      </AnimatePresence>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-lg mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'now' && <NowPage />}
              {activeTab === 'schedule' && <SchedulePage />}
              {activeTab === 'compete' && <CompetePage />}
              {activeTab === 'runs' && <RunsPage />}
              {activeTab === 'profile' && <ProfilePage onLogout={onLogout} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom tabs */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border">
        <div className="max-w-lg mx-auto flex">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[11px] font-medium">{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-court"
                    style={{ width: '100%' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
