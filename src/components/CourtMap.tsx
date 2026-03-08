import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, X, Search, Navigation, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { courts, checkIns, type Court } from '@/lib/db';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

mapboxgl.accessToken = 'pk.eyJ1IjoiZ2VuZXJhdGl2ZWplc3NlIiwiYSI6ImNtbWg1ejhsMzBwam0ycG9qc3ByNGhwa2oifQ.6F5H-1eSRcpUipoRgY7x5A';

interface Props {
  onClose: () => void;
  onSelectCourt?: (court: Court) => void;
}

export default function CourtMap({ onClose, onSelectCourt }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { session } = useAuth();
  const userId = session?.user?.id;

  const [allCourts, setAllCourts] = useState<Court[]>([]);
  const [courtCounts, setCourtCounts] = useState<Map<string, number>>(new Map());
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState('');
  const [addAddress, setAddAddress] = useState('');
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [geocodedLocation, setGeocodedLocation] = useState<{ lat: number; lng: number; display: string } | null>(null);

  const loadCourts = async () => {
    try {
      const c = await courts.getAll();
      setAllCourts(c);
    } catch (e) {
      console.error('Failed to load courts', e);
    }
  };

  useEffect(() => {
    loadCourts();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-98.5, 39.8], // US center
      zoom: 3.5,
    });

    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');

    // Try to get user location
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        map.current?.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 12,
          duration: 1500,
        });
      },
      () => {},
      { enableHighAccuracy: false, timeout: 5000 }
    );

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Add markers when courts or map change
  useEffect(() => {
    if (!map.current) return;

    const addMarkers = () => {
      // Remove existing markers
      document.querySelectorAll('.court-marker').forEach(el => el.remove());

      allCourts.forEach((court) => {
        const el = document.createElement('div');
        el.className = 'court-marker';
        el.style.cssText = `
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, hsl(32 95% 55%), hsl(42 90% 52%));
          border: 3px solid hsl(222 25% 6%);
          cursor: pointer;
          box-shadow: 0 0 16px 4px hsla(32, 95%, 55%, 0.4);
          transition: transform 0.2s;
          display: flex; align-items: center; justify-content: center;
        `;
        el.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(222,25%,6%)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
        el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.2)'; });
        el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)'; });

        const popup = new mapboxgl.Popup({ offset: 20, closeButton: false, className: 'court-popup' })
          .setHTML(`
            <div style="background:hsl(222,22%,9%);color:hsl(35,25%,93%);padding:10px 14px;border-radius:10px;font-family:'Space Grotesk',sans-serif;min-width:140px;">
              <p style="font-weight:600;font-size:13px;margin:0 0 2px;">${court.name}</p>
              <p style="font-size:11px;color:hsl(222,12%,48%);margin:0;">${court.address}</p>
              ${onSelectCourt ? `<button id="select-court-${court.id}" style="margin-top:8px;width:100%;padding:6px;border-radius:6px;background:linear-gradient(135deg,hsl(32,95%,55%),hsl(42,90%,52%));color:hsl(222,25%,6%);font-weight:600;font-size:11px;border:none;cursor:pointer;">Set as My Court</button>` : ''}
            </div>
          `);

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([court.lng, court.lat])
          .setPopup(popup)
          .addTo(map.current!);

        if (onSelectCourt) {
          popup.on('open', () => {
            setTimeout(() => {
              document.getElementById(`select-court-${court.id}`)?.addEventListener('click', () => {
                onSelectCourt(court);
                popup.remove();
              });
            }, 50);
          });
        }
      });
    };

    if (map.current.isStyleLoaded()) {
      addMarkers();
    } else {
      map.current.on('load', addMarkers);
    }
  }, [allCourts, onSelectCourt]);

  const handleGeocode = async () => {
    if (!addAddress.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addAddress)}&limit=1`,
        { headers: { 'User-Agent': 'LocalCheck/1.0' } }
      );
      const data = await res.json();
      if (data.length === 0) {
        toast.error('Address not found. Try a more specific address.');
        return;
      }
      const loc = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display: data[0].display_name };
      setGeocodedLocation(loc);
      map.current?.flyTo({ center: [loc.lng, loc.lat], zoom: 15, duration: 1200 });

      // Add temporary marker
      document.querySelectorAll('.temp-marker').forEach(el => el.remove());
      const el = document.createElement('div');
      el.className = 'temp-marker';
      el.style.cssText = `width:40px;height:40px;border-radius:50%;background:hsl(32,95%,55%);border:3px solid white;opacity:0.8;animation:pulse 1.5s infinite;`;
      new mapboxgl.Marker({ element: el }).setLngLat([loc.lng, loc.lat]).addTo(map.current!);
    } catch (e) {
      toast.error('Geocoding failed. Check your internet connection.');
    } finally {
      setSearching(false);
    }
  };

  const handleAddCourt = async () => {
    if (!userId || !geocodedLocation || !addName.trim()) return;
    setSubmitting(true);
    try {
      // Extract zip code from address
      const zipMatch = geocodedLocation.display.match(/\b\d{5}\b/);
      await courts.create(
        addName.trim(),
        addAddress.trim() || geocodedLocation.display,
        geocodedLocation.lat,
        geocodedLocation.lng,
        zipMatch?.[0] || null,
        userId
      );
      toast.success('Court added! 🏀');
      setShowAdd(false);
      setAddName('');
      setAddAddress('');
      setGeocodedLocation(null);
      document.querySelectorAll('.temp-marker').forEach(el => el.remove());
      await loadCourts();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to add court');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background"
    >
      {/* Map */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between">
        <button onClick={onClose} className="w-10 h-10 rounded-full glass border border-border flex items-center justify-center">
          <X className="w-5 h-5 text-foreground" />
        </button>
        <h2 className="font-display font-bold text-sm text-foreground glass px-4 py-2 rounded-full border border-border">
          Courts
        </h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="w-10 h-10 rounded-full bg-gradient-court flex items-center justify-center shadow-glow"
        >
          <Plus className="w-5 h-5 text-primary-foreground" />
        </button>
      </div>

      {/* Locate me */}
      <button
        onClick={() => {
          navigator.geolocation?.getCurrentPosition(
            (pos) => {
              map.current?.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 13, duration: 1200 });
            },
            () => toast.error('Location access denied')
          );
        }}
        className="absolute bottom-6 left-4 z-10 w-10 h-10 rounded-full glass border border-border flex items-center justify-center"
      >
        <Navigation className="w-4 h-4 text-primary" />
      </button>

      {/* Court count badge */}
      <div className="absolute bottom-6 right-4 z-10 glass border border-border rounded-full px-3 py-2 flex items-center gap-2">
        <MapPin className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-medium text-foreground">{allCourts.length} court{allCourts.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Add court panel */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 300, opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 z-20 glass border-t border-border rounded-t-2xl p-5 space-y-3"
          >
            <h3 className="font-display font-bold text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              Add a Court
            </h3>

            <input
              type="text"
              placeholder="Court name (e.g., 'Sunset Park Courts')"
              value={addName}
              onChange={e => setAddName(e.target.value)}
              className="w-full bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Address or location"
                value={addAddress}
                onChange={e => { setAddAddress(e.target.value); setGeocodedLocation(null); }}
                onKeyDown={e => e.key === 'Enter' && handleGeocode()}
                className="flex-1 bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <Button
                onClick={handleGeocode}
                disabled={searching || !addAddress.trim()}
                size="icon"
                className="shrink-0 bg-gradient-court text-primary-foreground h-[44px] w-[44px]"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>

            {geocodedLocation && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-court-green/10 border border-court-green/20 rounded-lg p-3 flex items-start gap-2">
                <Check className="w-4 h-4 text-court-green shrink-0 mt-0.5" />
                <p className="text-xs text-foreground leading-relaxed">{geocodedLocation.display}</p>
              </motion.div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleAddCourt}
                disabled={submitting || !geocodedLocation || !addName.trim()}
                className="flex-1 bg-gradient-court text-primary-foreground hover:opacity-90"
              >
                {submitting ? 'Adding...' : 'Add Court'}
              </Button>
              <Button variant="outline" onClick={() => { setShowAdd(false); setGeocodedLocation(null); }}>
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
