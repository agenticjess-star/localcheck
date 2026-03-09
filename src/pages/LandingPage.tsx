import { motion } from 'framer-motion';
import { MapPin, Calendar, Trophy, Users, ChevronRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  { icon: MapPin, title: 'Real-Time Check-ins', desc: 'See who\'s at the court right now. No more "anyone there?" texts.' },
  { icon: Calendar, title: 'Easy Scheduling', desc: 'Post when you\'re coming. See who else is planning to show up.' },
  { icon: Trophy, title: '1v1 Leaderboard', desc: 'Log matches, track Elo ratings, and climb the ranks.' },
  { icon: Users, title: 'Organize Runs', desc: 'Create events, manage RSVPs, auto-generate balanced teams.' },
];

const stats = [
  { value: '4–8pm', label: 'Peak hours covered' },
  { value: '0', label: 'Group texts needed' },
  { value: '∞', label: 'Buckets to get' },
];

export default function LandingPage({ onEnter, onSignIn }: { onEnter: () => void; onSignIn?: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero with background image */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-[-4px] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/images/hero-bg.jpeg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/65 to-background" />
        
        <div className="relative max-w-lg mx-auto px-6 pt-20 pb-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/40 backdrop-blur-md border border-foreground/10 text-foreground text-xs font-medium mb-6">
              <Zap className="w-3 h-3 text-primary" />
              Replace your group chat
            </div>
            
            <h1 className="font-display text-5xl sm:text-6xl font-bold leading-[1.1] mb-4 tracking-tight">
              <span className="text-gradient-sunset">Local</span><span className="text-foreground">Check</span>
            </h1>
            
            <p className="text-lg text-foreground/75 max-w-sm mx-auto mb-8 leading-relaxed">
              Know who's at the court, who's coming, and who's got next. Your pickup basketball community, simplified.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={onSignIn ?? onEnter}
                size="lg"
                className="bg-gradient-court text-primary-foreground hover:opacity-90 shadow-glow text-base px-8 h-12"
              >
                Sign Up
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={onEnter}
                className="border-foreground/20 text-foreground hover:bg-secondary backdrop-blur-sm h-12"
              >
                Check In
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-lg mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-card border border-border rounded-xl p-4 text-center shadow-card"
            >
              <div className="font-display font-bold text-lg text-primary">{s.value}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 space-y-4">
        <h2 className="font-display text-2xl font-bold text-center mb-8">
          Everything your court needs
        </h2>
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex items-start gap-4 bg-card border border-border rounded-xl p-4 shadow-card"
            >
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-sm mb-0.5">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* How it works */}
      <div className="max-w-lg mx-auto px-4 sm:px-6 pb-16">
        <h2 className="font-display text-2xl font-bold text-center mb-8">How it works</h2>
        <div className="space-y-4">
          {[
            { step: '1', title: 'Sign up', desc: 'Create your profile in seconds.' },
            { step: '2', title: 'Check in', desc: 'Tap "I\'m Here" when you arrive at the court.' },
            { step: '3', title: 'Play & compete', desc: 'Log 1v1s, join runs, and climb the leaderboard.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-sunset text-primary-foreground font-display font-bold flex items-center justify-center shrink-0">
                {item.step}
              </div>
              <div>
                <h3 className="font-display font-semibold text-sm">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-lg mx-auto px-4 sm:px-6 pb-16 text-center">
        <div className="bg-card border border-primary/20 rounded-2xl p-8 shadow-glow">
          <h2 className="font-display text-2xl font-bold mb-2">Ready to ball?</h2>
          <p className="text-sm text-muted-foreground mb-6">Join your court's community today.</p>
          <Button
            onClick={onEnter}
            size="lg"
            className="bg-gradient-court text-primary-foreground hover:opacity-90 shadow-glow px-8 h-12"
          >
            Get Started
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center">
        <p className="text-xs text-muted-foreground">
          Built for ballers, by ballers. <span className="text-gradient-sunset font-semibold">LocalCheck</span> © 2026
        </p>
      </footer>
    </div>
  );
}
