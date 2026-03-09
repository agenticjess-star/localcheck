import { motion, useScroll, useTransform } from 'framer-motion';
import {
  MapPin, Calendar, Trophy, Users, ChevronRight, Zap, Eye, Shuffle,
  Globe, Brain, Shield, TrendingUp, MessageCircleOff, Clock, Compass,
  Smartphone, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const problems = [
  { icon: MessageCircleOff, text: 'Endless group chats just to find a game' },
  { icon: MapPin, text: 'Courts missing from Google & Apple Maps' },
  { icon: Clock, text: 'Show up and nobody\'s there' },
  { icon: Shuffle, text: 'Awkward team picks & unbalanced runs' },
];

const features = [
  {
    icon: Eye,
    title: 'Never Show Up Alone',
    desc: 'Real-time check-ins + notifications show active players at your court. See who\'s there before you leave the house.',
    tag: 'Live',
  },
  {
    icon: Calendar,
    title: 'Plan Like a Pro',
    desc: 'Schedule games, send invites, auto-balance teams by ELO. No more "who\'s coming?" texts.',
    tag: 'Organize',
  },
  {
    icon: Compass,
    title: 'Know Where to Play',
    desc: 'Crowdsourced map of every hidden gem court — add your own in seconds. The definitive database.',
    tag: 'Discover',
  },
  {
    icon: TrendingUp,
    title: 'Level Up for Real',
    desc: 'Track games, hours, rankings per court & area. Watch your progress compound over time.',
    tag: 'Compete',
  },
  {
    icon: Globe,
    title: 'Travel & Instant Invites',
    desc: 'New in town or traveling? High-ranked locals spot your check-in and reach out. No awkward intros.',
    tag: 'Connect',
  },
  {
    icon: Brain,
    title: 'AI Game Analysis',
    desc: 'Phone-recorded game analysis, objective calls, post-game box scores. The future of pickup.',
    tag: 'Coming Soon',
  },
];

const stats = [
  { value: '13–70+', label: 'Age range served' },
  { value: '0', label: 'Group texts needed' },
  { value: '∞', label: 'Courts to discover' },
  { value: 'ELO', label: 'Skill-based matchmaking' },
];

const howSteps = [
  { step: '01', title: 'Add Your Court', desc: 'Drop a pin, snap a photo, name it. Takes 10 seconds.' },
  { step: '02', title: 'Check In', desc: 'Tap "I\'m Here" when you arrive. Friends get notified instantly.' },
  { step: '03', title: 'Organize Runs', desc: 'Post a game, set the format, let ELO balance the teams.' },
  { step: '04', title: 'Track & Climb', desc: 'Log 1v1s, see your rank, chase the top of the leaderboard.' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function LandingPage({ onEnter, onSignIn }: { onEnter: () => void; onSignIn?: () => void }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: (i: number = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: [0, 0, 0.2, 1] as const } }),
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ======================== HERO ======================== */}
      <div ref={heroRef} className="relative overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-[-8px] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/images/hero-bg.jpeg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background" />

        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="relative max-w-2xl mx-auto px-5 pt-20 pb-32 text-center">
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-background/40 backdrop-blur-md border border-foreground/10 text-foreground text-xs font-medium mb-6">
              <Zap className="w-3 h-3 text-primary" />
              AI-Enhanced Pickup Sports Platform
            </div>
          </motion.div>

          <motion.h1
            variants={fadeUp} initial="hidden" animate="show" custom={1}
            className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.08] mb-5 tracking-tight"
          >
            <span className="text-gradient-sunset">Find Your Game.</span><br />
            <span className="text-foreground">Track Your Progress.</span><br />
            <span className="text-foreground">Build Your </span>
            <span className="text-gradient-court">Crew.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp} initial="hidden" animate="show" custom={2}
            className="text-base sm:text-lg text-foreground/70 max-w-lg mx-auto mb-8 leading-relaxed"
          >
            The easiest way to discover local basketball &amp; pickleball courts, see who's playing
            right now, organize runs without the hassle, and level up with real rankings.
          </motion.p>

          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3} className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={onSignIn ?? onEnter}
              size="lg"
              className="bg-gradient-court text-primary-foreground hover:opacity-90 shadow-glow text-base px-8 h-12"
            >
              Get Started Free
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onEnter}
              className="border-foreground/20 text-foreground hover:bg-secondary backdrop-blur-sm h-12"
            >
              Check In Now
            </Button>
          </motion.div>

          <motion.p variants={fadeUp} initial="hidden" animate="show" custom={4} className="text-xs text-muted-foreground mt-4">
            Web app live now · Mobile coming soon · Always free to start
          </motion.p>
        </motion.div>
      </div>

      {/* ======================== STATS BAR ======================== */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 -mt-10 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i}
              className="bg-card border border-border rounded-xl p-4 text-center shadow-card"
            >
              <div className="font-display font-bold text-lg text-primary">{s.value}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ======================== THE PROBLEM ======================== */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 pt-20 pb-12">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-2 text-center">The Problem</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-3">
            Pickup sports are broken
          </h2>
          <p className="text-sm text-muted-foreground text-center max-w-md mx-auto mb-8">
            Passionate communities, zero infrastructure. Courts everywhere, no way to find or organize them.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {problems.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={i}
                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i}
                className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3.5 shadow-card"
              >
                <div className="p-2 rounded-lg bg-accent/10 text-accent shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-sm text-foreground/85">{p.text}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ======================== FEATURES ======================== */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2 text-center">The Solution</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-3">
            One app. Every court. Every game.
          </h2>
          <p className="text-sm text-muted-foreground text-center max-w-md mx-auto mb-10">
            Local Check becomes the source of truth for informal courts and games.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            const isComingSoon = f.tag === 'Coming Soon';
            return (
              <motion.div
                key={i}
                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i}
                className={`relative bg-card border rounded-xl p-5 shadow-card ${
                  isComingSoon ? 'border-accent/30 sm:col-span-2' : 'border-border'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl shrink-0 ${isComingSoon ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-semibold text-sm">{f.title}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isComingSoon
                          ? 'bg-accent/15 text-accent'
                          : 'bg-primary/15 text-primary'
                      }`}>{f.tag}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ======================== HOW IT WORKS ======================== */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2 text-center">How It Works</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-10">
            Four steps to better pickup
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {howSteps.map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i}
              className="flex items-start gap-4 bg-card border border-border rounded-xl p-5 shadow-card"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-sunset text-primary-foreground font-display font-bold text-sm flex items-center justify-center shrink-0">
                {item.step}
              </div>
              <div>
                <h3 className="font-display font-semibold text-sm mb-0.5">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ======================== WHO IT'S FOR ======================== */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2 text-center">Who It's For</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-10">
            Built for every kind of player
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { emoji: '🏀', title: 'The Regular', desc: 'You play 3× a week at your local court. You just want to know who\'s showing up.' },
            { emoji: '🏓', title: 'The Explorer', desc: 'New to town or traveling. Find the best courts and instant pickup wherever you go.' },
            { emoji: '🏆', title: 'The Competitor', desc: 'You want rankings, stats, and proof you\'re getting better. ELO doesn\'t lie.' },
          ].map((p, i) => (
            <motion.div
              key={i}
              variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i}
              className="bg-card border border-border rounded-xl p-5 text-center shadow-card"
            >
              <div className="text-3xl mb-3">{p.emoji}</div>
              <h3 className="font-display font-semibold text-sm mb-1">{p.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ======================== TRUST / PRINCIPLES ======================== */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Shield, label: 'Privacy-first design' },
            { icon: Sparkles, label: 'Always free to start' },
            { icon: Smartphone, label: 'Mobile-ready web app' },
          ].map((t, i) => {
            const Icon = t.icon;
            return (
              <motion.div
                key={i}
                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i}
                className="flex flex-col items-center gap-2 py-4"
              >
                <Icon className="w-5 h-5 text-primary" />
                <span className="text-[11px] text-muted-foreground text-center font-medium">{t.label}</span>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ======================== CTA ======================== */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 pb-20 text-center">
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="bg-card border border-primary/20 rounded-2xl p-8 sm:p-10 shadow-glow"
        >
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">Ready to play smarter?</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Add your court, check in, and start playing. No more empty courts or endless texts.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={onSignIn ?? onEnter}
              size="lg"
              className="bg-gradient-court text-primary-foreground hover:opacity-90 shadow-glow px-8 h-12"
            >
              Get Started Free
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onEnter}
              className="border-foreground/20 text-foreground hover:bg-secondary h-12"
            >
              Explore as Guest
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ======================== FOOTER ======================== */}
      <footer className="border-t border-border py-8 text-center space-y-2">
        <p className="text-xs text-muted-foreground">
          Built for ballers, by ballers. <span className="text-gradient-sunset font-semibold">LocalCheck</span> © 2026
        </p>
        <p className="text-[10px] text-muted-foreground/60">
          Basketball · Pickleball · Every court, everywhere
        </p>
      </footer>
    </div>
  );
}
