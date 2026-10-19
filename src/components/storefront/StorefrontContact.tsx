import React, { useState } from 'react';
import { Restaurant } from '../../types';
import { useDineCraft } from '../../context/DineCraftContext';
import { Phone, MapPin, Clock, MessageCircle, Send, CheckCircle2, Sparkles } from 'lucide-react';

interface StorefrontContactProps {
  restaurant: Restaurant;
  isPreviewMode?: boolean;
}

export const StorefrontContact: React.FC<StorefrontContactProps> = ({ restaurant }) => {
  const { addToast } = useDineCraft();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
    addToast({
      type: 'success',
      title: 'Message Sent',
      message: 'Thank you for reaching out. We will get back to you shortly.',
    });
  };

  const address = restaurant.address || restaurant.contact?.address || '104 Gourmet Boulevard';
  const city = restaurant.city || restaurant.contact?.city || 'Downtown District';
  const phone = restaurant.phone || restaurant.contact?.phone || '+1 (555) 234-5678';
  const openingHours = restaurant.openingHours || restaurant.contact?.openingHours || 'Daily: 11:00 AM – 10:00 PM';
  const whatsapp = restaurant.whatsappSupportNumber || restaurant.contact?.whatsapp || phone;

  return (
    <div className="space-y-8 sm:space-y-12 py-4 sm:py-6 text-[var(--text)]">
      {/* Header Bento Card */}
      <div className="sf-card p-6 sm:p-10 text-center max-w-4xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--brand-subtle)] text-[var(--brand)] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Get in Touch</span>
        </div>
        <h1
          className="text-2xl sm:text-4xl font-extrabold text-[var(--text)] tracking-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Contact & Location
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-lg mx-auto leading-relaxed">
          Have an inquiry, feedback, or need catering assistance? Reach out to our hospitality team directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Contact Info Bento Card */}
        <div className="sf-card p-6 sm:p-8 space-y-6">
          <h3
            className="text-lg font-bold text-[var(--text)]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Restaurant Information
          </h3>

          <div className="space-y-3 text-xs text-[var(--text-muted)]">
            <div className="sf-tile p-4 flex items-start gap-3 bg-[#F9FAFB]">
              <MapPin className="w-5 h-5 text-[var(--brand)] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[var(--text)]">Our Address</p>
                <p className="mt-0.5">{address}, {city}</p>
              </div>
            </div>

            <div className="sf-tile p-4 flex items-start gap-3 bg-[#F9FAFB]">
              <Phone className="w-5 h-5 text-[var(--brand)] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[var(--text)]">Direct Line</p>
                <p className="mt-0.5">{phone}</p>
              </div>
            </div>

            <div className="sf-tile p-4 flex items-start gap-3 bg-[#F9FAFB]">
              <Clock className="w-5 h-5 text-[var(--brand)] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[var(--text)]">Opening Hours</p>
                <p className="mt-0.5">{openingHours}</p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-black/5">
            <h4 className="text-xs font-bold text-[var(--text)] mb-1">Direct Chat Assistance</h4>
            <p className="text-xs text-[var(--text-muted)] mb-3 leading-relaxed">
              Need immediate answers regarding dietary allergens, reservations, or delivery timing?
            </p>
            <a
              href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="sf-button-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Message on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Message Form Bento Card */}
        <div className="sf-card p-6 sm:p-8">
          {submitted ? (
            <div className="flex flex-col items-center justify-center text-center py-10 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3
                className="text-lg font-bold text-[var(--text)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Message Received
              </h3>
              <p className="text-xs text-[var(--text-muted)] max-w-xs">
                Thank you for getting in touch. Our manager will reply to your email within 24 hours.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-xs font-semibold text-[var(--brand)] underline cursor-pointer pt-2"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3
                className="text-lg font-bold text-[var(--text)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Send Us a Note
              </h3>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text)]">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Marcus Vance"
                  className="w-full h-12 px-4 text-xs bg-[#F9FAFB] rounded-xl border border-black/5 text-[var(--text)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 focus:outline-hidden transition-all shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text)]">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. marcus@example.com"
                  className="w-full h-12 px-4 text-xs bg-[#F9FAFB] rounded-xl border border-black/5 text-[var(--text)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 focus:outline-hidden transition-all shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text)]">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Your inquiry or reservation details..."
                  className="w-full p-4 text-xs bg-[#F9FAFB] rounded-xl border border-black/5 text-[var(--text)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 focus:outline-hidden transition-all shadow-2xs resize-none"
                />
              </div>

              <button
                type="submit"
                className="sf-button-primary w-full py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer pt-1"
              >
                <span>Send Message</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
