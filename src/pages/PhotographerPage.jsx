import React, { useState, useEffect } from 'react';
import { photographerService } from '../services/photographerService';
import { photographerData } from '../data/photographer';
import { FrameCard } from '../components/cards/FrameCard';
import { Lightbox } from '../components/ui/Lightbox';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import {
  Camera,
  Compass,
  Sparkles,
  MapPin,
  Calendar,
  Send,
  Mail,
  ExternalLink,
  CheckCircle2,
  Sliders,
  Layers,
} from 'lucide-react';

export function PhotographerPage() {
  const [data, setData] = useState(null);
  const [activeLightboxFrame, setActiveLightboxFrame] = useState(null);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [inquiryType, setInquiryType] = useState('Print Inquiry');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const info = await photographerService.getPhotographerInfo();
        if (isMounted) setData(info || photographerData);
      } catch (err) {
        console.error('Failed to load photographer info:', err);
        if (isMounted) setData(photographerData);
      }
    }
    load();
    window.scrollTo(0, 0);
    return () => {
      isMounted = false;
    };
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactEmail.trim() || !contactMessage.trim()) return;

    setIsSubmitting(true);
    await photographerService.submitContact({
      name: contactName,
      email: contactEmail,
      type: inquiryType,
      message: contactMessage,
    });
    setIsSubmitting(false);
    showToast('Your letter has reached Ayush. You will receive a response shortly.', 'success');
    setContactName('');
    setContactEmail('');
    setContactMessage('');
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 text-muted">
        Opening photographer’s personal journal...
      </div>
    );
  }

  const portraitSrc = data.portrait
    ? data.portrait.startsWith('/') || data.portrait.startsWith('http')
      ? data.portrait
      : `/images/${data.portrait}`
    : '/images/placeholder.jpg';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 w-full space-y-24">
      {/* 1. Hero Section: Intimate Portrait & Statement */}
      <section className="space-y-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 md:gap-12 pb-12 border-b border-line">
          <div className="w-48 h-60 sm:w-60 sm:h-72 md:w-72 md:h-84 shrink-0 rounded-3xl overflow-hidden border border-line shadow-warm-lg bg-surface relative">
            <img
              src={portraitSrc}
              alt={data.name || 'Ayush Misra'}
              onError={(e) => {
                e.target.src = '/images/placeholder.jpg';
              }}
              className="w-full h-full object-cover"
            />
            {data.location && (
              <div className="absolute bottom-3 left-3 right-3 text-center py-1 rounded-pill bg-black/60 backdrop-blur-md text-white text-[11px] font-mono">
                {data.location}
              </div>
            )}
          </div>

          <div className="space-y-4 text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-accent/15 text-accent text-2xs font-mono uppercase tracking-widest font-semibold">
              The Photographer's Journal
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-medium text-ink leading-tight">
              {data.name}
            </h1>
            {data.title && (
              <p className="text-xs sm:text-sm text-accent font-medium font-sans">
                {data.title}
              </p>
            )}
            {data.tagline && (
              <p className="font-handwritten text-2xl sm:text-3xl text-ink/90 leading-snug pt-2">
                "{data.tagline}"
              </p>
            )}
            {data.statement && (
              <p className="text-xs sm:text-sm text-muted leading-relaxed font-sans max-w-xl">
                {data.statement}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 2. Philosophy Pillars */}
      {data.philosophy && data.philosophy.length > 0 && (
        <section className="space-y-8">
          <div className="space-y-2">
            <span className="text-2xs uppercase tracking-widest font-mono text-muted font-semibold">
              Approach & Creed
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-ink">
              Philosophy of the Shutter
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.philosophy.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-surface border border-line shadow-warm-sm flex flex-col justify-between space-y-3"
              >
                <span className="font-mono text-xs text-accent font-semibold">
                  0{idx + 1}
                </span>
                <h3 className="font-serif text-lg font-medium text-ink">
                  {item.title}
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Vertical Journey Timeline */}
      {data.timeline && data.timeline.length > 0 && (
        <section className="space-y-8">
          <div className="space-y-2">
            <span className="text-2xs uppercase tracking-widest font-mono text-muted font-semibold">
              Continuum
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-ink">
              Milestones & Field Chapters
            </h2>
          </div>

          <div className="relative pl-6 sm:pl-8 border-l border-line space-y-10">
            {data.timeline.map((step, idx) => (
              <div key={idx} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full bg-surface border-2 border-accent group-hover:bg-accent transition-colors" />

                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold text-accent">
                      {step.year}
                    </span>
                    {step.location && (
                      <>
                        <span className="text-muted text-[10px]">•</span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted font-medium">
                          <MapPin className="w-3 h-3 text-accent" />
                          {step.location}
                        </span>
                      </>
                    )}
                  </div>
                  <h3 className="font-serif text-lg font-medium text-ink">
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted leading-relaxed max-w-2xl">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Gear & Field Essentials */}
      {data.gear && data.gear.length > 0 && (
        <section id="gear" className="space-y-8">
          <div className="space-y-2">
            <span className="text-2xs uppercase tracking-widest font-mono text-muted font-semibold">
              Instruments
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-ink">
              Camera Gear & Bag
            </h2>
            <p className="text-xs text-muted max-w-xl">
              Tools chosen for tactile reliability in dust, rain, high altitude, and quiet sanctuaries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.gear.map((group, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-surface border border-line shadow-warm-sm space-y-4"
              >
                <h3 className="text-xs uppercase font-mono tracking-wider text-accent font-semibold border-b border-line pb-2">
                  {group.category}
                </h3>
                <ul className="space-y-3">
                  {group.items?.map((item, i) => (
                    <li key={i} className="text-xs space-y-0.5">
                      <span className="font-medium text-ink block">{item.name}</span>
                      <span className="text-[11px] text-muted block leading-snug">
                        {item.detail}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Currently Exploring Banner */}
      {data.currentExploration && (
        <section className="rounded-3xl border border-line bg-surface p-6 sm:p-10 shadow-warm-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            {data.currentExploration.status && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-accent-soft/25 text-accent text-2xs font-mono uppercase tracking-wider font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> {data.currentExploration.status}
              </span>
            )}
            <h3 className="font-serif text-xl sm:text-2xl font-medium text-ink">
              {data.currentExploration.title}
            </h3>
            <p className="text-xs text-muted max-w-2xl leading-relaxed">
              {data.currentExploration.note}
            </p>
          </div>
        </section>
      )}

      {/* 6. Favorite Frames */}
      {data.favoriteFrames && data.favoriteFrames.length > 0 && (
        <section className="space-y-8">
          <div className="space-y-2">
            <span className="text-2xs uppercase tracking-widest font-mono text-muted font-semibold">
              Curator's Choice
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-ink">
              Personal Favorites
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.favoriteFrames.map((frame) => (
              <FrameCard
                key={frame.id}
                frame={frame}
                onOpenLightbox={(f) => setActiveLightboxFrame(f)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 7. Contact Form & Social Links */}
      <section id="contact" className="rounded-3xl border border-line bg-surface p-6 sm:p-12 shadow-warm-lg space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Left: Contact copy & social links */}
          <div className="md:col-span-5 space-y-6">
            <div className="space-y-2">
              <span className="text-2xs font-mono uppercase tracking-widest text-accent font-semibold">
                Correspondence
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-ink">
                Get in Touch
              </h2>
              <p className="text-xs text-muted leading-relaxed">
                For limited edition archival prints, editorial stories, collaborative field expeditions, or simply to discuss light.
              </p>
            </div>

            {data.socials && data.socials.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-line">
                <h4 className="text-2xs uppercase font-mono tracking-wider text-muted font-semibold">
                  Elsewhere on the web
                </h4>
                <div className="flex flex-col gap-2">
                  {data.socials.map((soc) => (
                    <a
                      key={soc.name}
                      href={soc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-between text-xs text-ink hover:text-accent transition-colors p-2 rounded-lg bg-bg border border-line"
                    >
                      <span>{soc.name}</span>
                      <span className="text-[11px] text-muted font-mono">{soc.handle}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Contact Form */}
          <div className="md:col-span-7">
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-2xs font-mono uppercase tracking-wider text-muted font-semibold block">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Kabir Sen"
                    className="w-full px-4 py-2.5 bg-bg border border-line rounded-pill text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-mono uppercase tracking-wider text-muted font-semibold block">
                    Your Email
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="kabir@example.com"
                    className="w-full px-4 py-2.5 bg-bg border border-line rounded-pill text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-2xs font-mono uppercase tracking-wider text-muted font-semibold block">
                  Inquiry Nature
                </label>
                <select
                  value={inquiryType}
                  onChange={(e) => setInquiryType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-bg border border-line rounded-pill text-xs text-ink focus:outline-none focus:border-accent"
                >
                  <option value="Print Inquiry">Archival Fine Art Print Inquiry</option>
                  <option value="Editorial / Assignment">Editorial & Assignment Commission</option>
                  <option value="Collaboration">Exhibition & Cultural Collaboration</option>
                  <option value="Personal Note">A Quiet Personal Note</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-2xs font-mono uppercase tracking-wider text-muted font-semibold block">
                  Message
                </label>
                <textarea
                  rows={4}
                  required
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Share details about what you have in mind..."
                  className="w-full p-3.5 bg-bg border border-line rounded-2xl text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent resize-none"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                iconRight={Send}
                className="w-full sm:w-auto"
              >
                Send Message to Ayush
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <Lightbox
        isOpen={!!activeLightboxFrame}
        onClose={() => setActiveLightboxFrame(null)}
        currentFrame={activeLightboxFrame}
      />
    </div>
  );
}
