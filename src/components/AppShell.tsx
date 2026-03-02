import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Trophy, Users, Bell } from 'lucide-react';
import NowPage from '@/pages/NowPage';
import SchedulePage from '@/pages/SchedulePage';
import CompetePage from '@/pages/CompetePage';
import RunsPage from '@/pages/RunsPage';
import ProfilePage from '@/pages/ProfilePage';
import { useAuth } from '@/lib/auth-context';
import { getInitials } from '@/lib/mock-data';

const tabs = [
  { id: 'now', label: 'Now', icon: MapPin },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'compete', label: 'Compete', icon: Trophy },
  { id: 'runs', label: 'Runs', icon: Users },
] as const;

type TabId = typeof tabs[number]['id'] | 'profile';

export default function AppShell({ onLogout }: { onLogout: () => void }) {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('now');

  const displayName = profile?.name ?? 'User';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="font-display text-lg font-bold text-gradient-sunset">LocalCheck</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('profile')}
              className="w-8 h-8 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center hover:bg-primary/30 transition-colors"
            >
              {getInitials(displayName)}
            </button>
          </div>
        </div>
      </header>

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
                className={`relative flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute top-0 inset-x-0 h-0.5 bg-gradient-court"
                  />
                )}
                <Icon className="w-5 h-5" />
                <span className="text-[11px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
