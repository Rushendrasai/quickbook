import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useCallback, useEffect, useState } from "react";

const NAV_LINKS = [
  { label: "Home", href: "https://hubcity.net" },
  { label: "Other Tools", href: "https://hubcity.net/businesstools.html" },
  { label: "Crypto Tools", href: "https://hubcity.net/cryptotoo;s.html" },
  { label: "Contact Us", href: "https://hubcity.net/contacthubcity.html" },
];

function CalendarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      aria-label="Calendar"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

// ── DATE HELPERS ──
function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDisplay(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function getDayLabel(windowStart: Date, index: 0 | 1 | 2): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(windowStart);
  d.setDate(d.getDate() + index);
  d.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return d.toLocaleDateString("en-US", { weekday: "long" });
}

function generateSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 9; hour <= 16; hour++) {
    const ampm = hour >= 12 ? "PM" : "AM";
    const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    slots.push(`${String(h).padStart(2, "0")}:00 ${ampm}`);
  }
  return slots;
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

// ── MAIN APP ──
export default function App() {
  const { actor } = useActor(createActor);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Calendar state
  const [windowStart, setWindowStart] = useState<Date>(() =>
    startOfDay(new Date()),
  );
  const [bookedSlotsMap, setBookedSlotsMap] = useState<
    Record<string, string[]>
  >({});
  const [selectedSlot, setSelectedSlot] = useState<{
    date: string;
    time: string;
  } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", issue: "" });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Derived: the 3 visible day dates
  const days = [0, 1, 2].map((i) => {
    const d = new Date(windowStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  // Fetch booked slots for all visible days
  const fetchBookedSlots = useCallback(async () => {
    if (!actor) return;
    const dateStrings = [0, 1, 2].map((i) => {
      const d = new Date(windowStart);
      d.setDate(d.getDate() + i);
      return formatDate(d);
    });
    const results = await Promise.all(
      dateStrings.map((date) => actor.getBookedSlots(date)),
    );
    const newMap: Record<string, string[]> = {};
    dateStrings.forEach((date, i) => {
      newMap[date] = results[i];
    });
    setBookedSlotsMap(newMap);
  }, [actor, windowStart]); // windowStart is a stable Date value per render

  useEffect(() => {
    fetchBookedSlots();
  }, [fetchBookedSlots]);

  // Navigation limits
  const today = startOfDay(new Date());
  const maxWindowStart = new Date(today);
  maxWindowStart.setDate(today.getDate() + 27); // last window: +27 so last day is today+29
  const canPrev = windowStart > today;
  const canNext =
    new Date(windowStart.getTime() + 3 * 86400000) <= maxWindowStart;

  function shiftWindow(delta: number) {
    setWindowStart((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + delta);
      return next;
    });
  }

  function openModal(date: string, time: string) {
    setSelectedSlot({ date, time });
    setFormData({ name: "", phone: "", issue: "" });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setSelectedSlot(null);
  }

  async function handleBooking() {
    if (!formData.name.trim() || !formData.phone.trim()) {
      setToast("Please fill in your name and phone number.");
      setTimeout(() => setToast(null), 4000);
      return;
    }
    if (!actor || !selectedSlot) return;
    setSubmitting(true);
    try {
      await actor.addBooking(
        formData.name.trim(),
        formData.phone.trim(),
        formData.issue.trim(),
        selectedSlot.time,
        selectedSlot.date,
      );
      closeModal();
      await fetchBookedSlots();
      setToast("Booking Confirmed! You'll receive a text message shortly.");
      setTimeout(() => setToast(null), 5000);
    } catch (_err) {
      setToast("Booking failed. Please try again.");
      setTimeout(() => setToast(null), 4000);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* ── TOP NAV ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Brand */}
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600 text-white p-1.5 rounded-lg">
                <CalendarIcon />
              </div>
              <span className="text-lg font-black text-slate-800 tracking-tight">
                TIGOY.com <span className="text-emerald-600">|</span> QuickBook
              </span>
            </div>

            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors duration-200"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Right side badges + mobile menu toggle */}
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Public Link Active
              </span>
              {/* Mobile hamburger */}
              <button
                type="button"
                className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-label="Toggle menu"
                data-ocid="nav.mobile_menu_toggle"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile dropdown */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-3 pb-2 border-t border-slate-100 pt-3 flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-slate-700 hover:text-emerald-600 py-1 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* ── TOP AD BANNER ── */}
      <div className="w-full flex justify-center bg-white border-b border-slate-100 py-3 px-4">
        <a
          href="https://adsection.tigoy.com/ad001.html"
          target="_blank"
          rel="noopener noreferrer"
          data-ocid="top_ad.link"
        >
          <img
            src="https://adsection.tigoy.com/001.png"
            alt="Advertisement"
            style={{
              width: "960px",
              height: "200px",
              maxWidth: "100%",
              display: "block",
            }}
          />
        </a>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Service Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-3xl border border-emerald-100">
              👨‍🔧
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800">
                John's Plumbing
              </h1>
              <p className="text-slate-500 font-medium text-sm mt-0.5">
                60-minute service call • $80 base rate
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right shrink-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Current Timezone
            </p>
            <p className="text-xs font-bold text-slate-700">
              America/New_York (GMT-4)
            </p>
          </div>
        </div>

        {/* ── CALENDAR SECTION ── */}
        <section data-ocid="calendar.section" className="space-y-4">
          {/* Date Navigation */}
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() => shiftWindow(-3)}
              disabled={!canPrev}
              data-ocid="calendar.prev_button"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm border-2 border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Prev
            </button>
            <span className="text-sm font-semibold text-slate-500">
              {formatDisplay(days[0])} – {formatDisplay(days[2])}
            </span>
            <button
              type="button"
              onClick={() => shiftWindow(3)}
              disabled={!canNext}
              data-ocid="calendar.next_button"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm border-2 border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* 3-Day Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {days.map((day, i) => {
              const dateStr = formatDate(day);
              const booked = bookedSlotsMap[dateStr] ?? [];
              const label = getDayLabel(windowStart, i as 0 | 1 | 2);
              const isToday = label === "Today";
              return (
                <div
                  key={dateStr}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm"
                >
                  {/* Day Header */}
                  <div className="bg-slate-50 p-4 border-b border-slate-100 text-center">
                    <p
                      className={`text-[10px] font-bold uppercase tracking-widest ${
                        isToday ? "text-emerald-600" : "text-slate-400"
                      }`}
                    >
                      {label}
                    </p>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">
                      {formatDisplay(day)}
                    </p>
                  </div>
                  {/* Slots */}
                  <div
                    className="p-4 space-y-2"
                    data-ocid={`calendar.day_${i + 1}.list`}
                  >
                    {generateSlots().map((slot, si) => {
                      const isBooked = booked.includes(slot);
                      return isBooked ? (
                        <button
                          key={slot}
                          type="button"
                          disabled
                          data-ocid={`calendar.day_${i + 1}.item.${si + 1}`}
                          className="w-full p-3 rounded-xl border-2 border-transparent bg-slate-100 text-slate-400 line-through cursor-not-allowed font-bold text-sm"
                        >
                          {slot}
                        </button>
                      ) : (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => openModal(dateStr, slot)}
                          data-ocid={`calendar.day_${i + 1}.item.${si + 1}`}
                          className="w-full p-3 rounded-xl border-2 border-emerald-100 bg-white text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 font-bold text-sm transition-all duration-200 active:scale-95"
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── BOOKING MODAL ── */}
        {modalOpen && (
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-50"
            role="presentation"
            onKeyDown={(e) => {
              if (e.key === "Escape") closeModal();
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) closeModal();
            }}
            data-ocid="booking.modal"
          >
            <div className="bg-white w-full max-w-md rounded-[2rem] p-6 sm:p-8 shadow-2xl">
              <h3 className="text-2xl font-black text-slate-800 mb-1">
                Complete Booking
              </h3>
              <p className="text-emerald-600 font-bold text-sm mb-6 uppercase tracking-tight">
                {selectedSlot &&
                  `${formatDisplay(new Date(`${selectedSlot.date}T12:00:00`))} • ${selectedSlot.time}`}
              </p>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, name: e.target.value }))
                  }
                  data-ocid="booking.name_input"
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-sm text-slate-800 placeholder-slate-400"
                />
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, phone: e.target.value }))
                  }
                  data-ocid="booking.phone_input"
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-sm text-slate-800 placeholder-slate-400"
                />
                <textarea
                  placeholder="Briefly describe the issue..."
                  value={formData.issue}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, issue: e.target.value }))
                  }
                  data-ocid="booking.issue_textarea"
                  rows={3}
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-sm text-slate-800 placeholder-slate-400 resize-none"
                />
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    data-ocid="booking.cancel_button"
                    className="flex-1 py-3.5 font-bold text-slate-400 hover:text-slate-600 transition-colors rounded-2xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleBooking}
                    disabled={submitting}
                    data-ocid="booking.submit_button"
                    className="flex-[2] py-3.5 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Booking..." : "Book Slot"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── TOAST NOTIFICATION ── */}
      {toast && (
        <div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl max-w-sm text-center"
          data-ocid="toast.notification"
        >
          {toast}
        </div>
      )}

      {/* ── BOTTOM AD BANNER ── */}
      <div className="w-full flex justify-center bg-white border-t border-slate-100 py-3 px-4">
        <a
          href="https://adsection.tigoy.com/ad002.html"
          target="_blank"
          rel="noopener noreferrer"
          data-ocid="bottom_ad.link"
        >
          <img
            src="https://adsection.tigoy.com/002.png"
            alt="Advertisement"
            style={{
              width: "960px",
              height: "200px",
              maxWidth: "100%",
              display: "block",
            }}
          />
        </a>
      </div>

      {/* ── STICKY FOOTER ── */}
      <footer className="bg-white border-t border-slate-200">
        {/* Footer nav */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap justify-center gap-4 sm:gap-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>
        {/* Copyright */}
        <div className="border-t border-slate-100 py-3 text-center">
          <p className="text-xs text-slate-400 font-medium">
            © 2025 TIGOY.com | Hubcity.com. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
