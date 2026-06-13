import { useState } from "react";
import { callGeminiJSON } from "../../utils/gemini";
import {
  buildOptionsPromptA,
  buildOptionsPromptB,
  buildItineraryPrompt,
} from "../../utils/wizardPrompts";
import ItineraryView from "./ItineraryView";

const WEATHER_OPTIONS = ["Warm and sunny", "Cold and crisp", "Mild", "No preference"];
const EXPERIENCE_OPTIONS = ["Adventure", "Sightseeing", "Relaxed", "Foodie", "Culture", "Nature", "Nightlife"];
const PACE_OPTIONS = ["Packed", "Balanced", "Relaxed"];
const STEPS = ["Preferences", "Pick & Mix", "Your Itinerary"];

const CURRENCIES = ["USD", "EUR", "GBP", "AED", "INR", "JPY", "SGD", "AUD", "CAD", "CHF"];
const CURRENCY_SYMBOLS = {
  USD: "$", EUR: "€", GBP: "£", AED: "د.إ", INR: "₹",
  JPY: "¥", SGD: "S$", AUD: "A$", CAD: "C$", CHF: "Fr",
};
const SPENDING_STYLES = [
  { label: "Budget", desc: "Hostels, street food, public transport" },
  { label: "Comfort", desc: "Mid-range hotels, sit-down restaurants, occasional taxis" },
  { label: "Luxury", desc: "4–5 star hotels, fine dining, private transfers" },
];

const TRIPS_KEY = "triply_trips";

const initialState = {
  path: null, // 'A' | 'B'
  step: 1, // 1, 2, 3
  // Path A inputs
  regions: [],
  weather: "No preference",
  experiences: [],
  // Path B inputs
  destination: "",
  mustVisit: [],
  restaurants: [],
  pace: "Balanced",
  // shared inputs
  days: 5,
  hoursPerDay: 6,
  currency: "USD",
  budget: 2000,
  spendingStyle: "Comfort",
  // results
  options: [],
  selected: [], // mixed highlights (array of strings)
  itinerary: null,
  // async flags
  optionsLoading: false,
  optionsError: null,
  itineraryLoading: false,
  itineraryError: null,
};

// ── Small presentational helpers ─────────────────────────────────────────────

function StepBar({ current }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const active = n === current;
        const done = n < current;
        return (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                  active
                    ? "bg-violet-600 text-white"
                    : done
                    ? "bg-violet-200 dark:bg-violet-900 text-violet-700 dark:text-violet-300"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                }`}
              >
                {done ? "✓" : n}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block truncate ${
                  active ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {label}
              </span>
            </div>
            {n < STEPS.length && (
              <div className={`h-0.5 flex-1 rounded ${done ? "bg-violet-300" : "bg-gray-100 dark:bg-gray-700"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function TagInput({ label, placeholder, tags, onChange }) {
  const [draft, setDraft] = useState("");
  function add() {
    const v = draft.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setDraft("");
  }
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 text-xs bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 rounded-full px-3 py-1"
          >
            {t}
            <button
              type="button"
              onClick={() => onChange(tags.filter((x) => x !== t))}
              className="hover:text-red-500"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
        placeholder={placeholder}
        className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
      />
    </div>
  );
}

function PillGroup({ label, options, value, multi, onChange }) {
  function toggle(opt) {
    if (multi) {
      onChange(value.includes(opt) ? value.filter((x) => x !== opt) : [...value, opt]);
    } else {
      onChange(opt);
    }
  }
  const isOn = (opt) => (multi ? value.includes(opt) : value === opt);
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`text-sm rounded-full px-4 py-1.5 border transition-colors ${
              isOn(opt)
                ? "bg-violet-600 border-violet-600 text-white"
                : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-violet-300"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function SkeletonCards({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="border border-gray-100 dark:border-gray-700 rounded-2xl p-5 bg-white dark:bg-gray-800 animate-pulse"
        >
          <div className="h-5 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
          <div className="h-3 w-1/2 bg-gray-100 dark:bg-gray-700 rounded mb-4" />
          <div className="space-y-2">
            <div className="h-3 w-full bg-gray-100 dark:bg-gray-700 rounded" />
            <div className="h-3 w-5/6 bg-gray-100 dark:bg-gray-700 rounded" />
            <div className="h-3 w-4/6 bg-gray-100 dark:bg-gray-700 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function BudgetFields({ s, set }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Home currency
          </label>
          <select
            value={s.currency}
            onChange={(e) => set({ currency: e.target.value })}
            className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          >
            {CURRENCIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Total trip budget
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400 pointer-events-none">
              {CURRENCY_SYMBOLS[s.currency]}
            </span>
            <input
              type="number"
              min={0}
              value={s.budget}
              onChange={(e) => set({ budget: Number(e.target.value) })}
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Spending style
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {SPENDING_STYLES.map((opt) => {
            const on = s.spendingStyle === opt.label;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => set({ spendingStyle: opt.label })}
                className={`text-left rounded-2xl px-4 py-3 border transition-colors ${
                  on
                    ? "bg-violet-600 border-violet-600 text-white"
                    : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-violet-300"
                }`}
              >
                <span className="block text-sm font-semibold">{opt.label}</span>
                <span className={`block text-xs mt-0.5 ${on ? "text-violet-100" : "text-gray-400 dark:text-gray-400"}`}>
                  {opt.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ErrorBox({ message, onRetry }) {
  return (
    <div className="border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 rounded-2xl p-5 text-center">
      <p className="text-sm text-red-700 dark:text-red-300 mb-3">⚠️ {message}</p>
      <button
        onClick={onRetry}
        className="bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
      >
        Retry
      </button>
    </div>
  );
}

// ── Main wizard ───────────────────────────────────────────────────────────────

export default function PlanWizard({ onClose, onSaved }) {
  const [s, setS] = useState(initialState);
  const set = (patch) => setS((prev) => ({ ...prev, ...patch }));

  // Toggle a highlight in the mixed selection.
  function toggleHighlight(text) {
    setS((prev) => ({
      ...prev,
      selected: prev.selected.includes(text)
        ? prev.selected.filter((x) => x !== text)
        : [...prev.selected, text],
    }));
  }

  // ── Gemini call 1: trip options ──
  async function fetchOptions() {
    set({ optionsLoading: true, optionsError: null, step: 2 });
    try {
      const prompt = s.path === "A" ? buildOptionsPromptA(s) : buildOptionsPromptB(s);
      const data = await callGeminiJSON(prompt);
      const options = Array.isArray(data?.options) ? data.options : [];
      if (options.length === 0) throw new Error("No options returned. Please retry.");
      set({ options, optionsLoading: false });
    } catch (err) {
      set({ optionsError: err.message, optionsLoading: false });
    }
  }

  // ── Gemini call 2: full itinerary ──
  async function buildItinerary() {
    set({ itineraryLoading: true, itineraryError: null, step: 3 });
    try {
      const prompt = buildItineraryPrompt(s, s.selected);
      const itinerary = await callGeminiJSON(prompt);
      if (!itinerary?.days) throw new Error("Itinerary came back malformed. Please retry.");
      set({ itinerary, itineraryLoading: false });
      saveTrip(itinerary);
    } catch (err) {
      set({ itineraryError: err.message, itineraryLoading: false });
    }
  }

  function saveTrip(itinerary) {
    let trips = [];
    try {
      trips = JSON.parse(localStorage.getItem(TRIPS_KEY)) || [];
    } catch {
      trips = [];
    }
    trips.push({
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      ...itinerary,
    });
    localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
    if (onSaved) onSaved();
  }

  // Highlights available to mix = highlights + addedByAI from every option.
  const allHighlights = s.options.flatMap((opt) => [
    ...(opt.highlights || []).map((h) => ({ text: h, ai: false, from: opt.destination })),
    ...(opt.addedByAI || []).map((h) => ({ text: h, ai: true, from: opt.destination })),
  ]);

  // ── RENDER ──
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-4xl my-4 max-h-[95vh] flex flex-col">
        {/* Header + step bar */}
        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Plan a trip</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl leading-none"
            >
              ×
            </button>
          </div>
          {s.path && <StepBar current={s.step} />}
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto">
          {/* PATH CHOOSER */}
          {!s.path && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => set({ path: "A", step: 1 })}
                className="text-left border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-violet-400 hover:shadow-md transition-all bg-white dark:bg-gray-800"
              >
                <div className="text-3xl mb-3">🧭</div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">I don't know where to go</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Tell us your vibe and we'll suggest 3 destinations to mix and match.
                </p>
              </button>
              <button
                onClick={() => set({ path: "B", step: 1 })}
                className="text-left border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-violet-400 hover:shadow-md transition-all bg-white dark:bg-gray-800"
              >
                <div className="text-3xl mb-3">📍</div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">I know my destination</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Give us your spots and we'll build 2 curated plans, plus ideas you missed.
                </p>
              </button>
            </div>
          )}

          {/* STEP 1 — INPUTS */}
          {s.path === "A" && s.step === 1 && (
            <div className="space-y-5">
              <TagInput
                label="Countries or regions you're open to"
                placeholder="Type and press Enter (e.g. Japan)"
                tags={s.regions}
                onChange={(regions) => set({ regions })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Weather preference
                </label>
                <select
                  value={s.weather}
                  onChange={(e) => set({ weather: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                >
                  {WEATHER_OPTIONS.map((w) => (
                    <option key={w}>{w}</option>
                  ))}
                </select>
              </div>
              <PillGroup
                label="Experience types"
                options={EXPERIENCE_OPTIONS}
                value={s.experiences}
                multi
                onChange={(experiences) => set({ experiences })}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Number of days
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={s.days}
                    onChange={(e) => set({ days: Number(e.target.value) })}
                    className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Hours per day on activities: <span className="text-violet-600 dark:text-violet-300">{s.hoursPerDay}h</span>
                  </label>
                  <input
                    type="range"
                    min={2}
                    max={10}
                    value={s.hoursPerDay}
                    onChange={(e) => set({ hoursPerDay: Number(e.target.value) })}
                    className="w-full accent-violet-600 mt-3"
                  />
                </div>
              </div>
              <BudgetFields s={s} set={set} />
            </div>
          )}

          {s.path === "B" && s.step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Destination
                </label>
                <input
                  value={s.destination}
                  onChange={(e) => set({ destination: e.target.value })}
                  placeholder="e.g. Tokyo, Japan"
                  className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>
              <TagInput
                label="Places you definitely want to visit"
                placeholder="Type and press Enter (e.g. Senso-ji Temple)"
                tags={s.mustVisit}
                onChange={(mustVisit) => set({ mustVisit })}
              />
              <TagInput
                label="Restaurants you want to try"
                placeholder="Type and press Enter (e.g. Ichiran Ramen)"
                tags={s.restaurants}
                onChange={(restaurants) => set({ restaurants })}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Number of days
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={s.days}
                    onChange={(e) => set({ days: Number(e.target.value) })}
                    className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </div>
                <PillGroup
                  label="Pace"
                  options={PACE_OPTIONS}
                  value={s.pace}
                  onChange={(pace) => set({ pace })}
                />
              </div>
              <BudgetFields s={s} set={set} />
            </div>
          )}

          {/* STEP 2 — OPTIONS + MIX */}
          {s.step === 2 && (
            <div>
              {s.optionsLoading && <SkeletonCards count={s.path === "A" ? 3 : 2} />}
              {s.optionsError && <ErrorBox message={s.optionsError} onRetry={fetchOptions} />}
              {!s.optionsLoading && !s.optionsError && s.options.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
                  {/* Option cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {s.options.map((opt) => (
                      <div
                        key={opt.id}
                        className="border border-gray-100 dark:border-gray-700 rounded-2xl p-5 bg-white dark:bg-gray-800"
                      >
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{opt.destination}</h3>
                        <p className="text-sm text-violet-600 dark:text-violet-300 italic">{opt.tagline}</p>
                        <div className="flex flex-wrap gap-2 mt-2 mb-3">
                          {opt.vibe && (
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full px-2 py-0.5">
                              {opt.vibe}
                            </span>
                          )}
                          {opt.bestTimeToVisit && (
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full px-2 py-0.5">
                              🗓 {opt.bestTimeToVisit}
                            </span>
                          )}
                          {opt.estimatedBudget && (
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full px-2 py-0.5">
                              💰 {opt.estimatedBudget}
                            </span>
                          )}
                        </div>
                        {opt.whyThisTrip && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{opt.whyThisTrip}</p>
                        )}

                        <p className="text-[11px] uppercase tracking-wide font-semibold text-gray-400 dark:text-gray-500 mb-1.5">
                          Highlights — tick to add
                        </p>
                        <div className="space-y-1.5">
                          {(opt.highlights || []).map((h) => (
                            <label key={h} className="flex items-start gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                              <input
                                type="checkbox"
                                checked={s.selected.includes(h)}
                                onChange={() => toggleHighlight(h)}
                                className="mt-0.5 accent-violet-600"
                              />
                              <span>{h}</span>
                            </label>
                          ))}
                          {(opt.addedByAI || []).map((h) => (
                            <label key={h} className="flex items-start gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                              <input
                                type="checkbox"
                                checked={s.selected.includes(h)}
                                onChange={() => toggleHighlight(h)}
                                className="mt-0.5 accent-violet-600"
                              />
                              <span>
                                {h}
                                <span className="ml-1 text-[10px] bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 rounded-full px-1.5 py-0.5">
                                  AI pick
                                </span>
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Your Mix panel */}
                  <div className="lg:sticky lg:top-0 self-start">
                    <div className="border border-violet-200 dark:border-violet-900 bg-violet-50 dark:bg-violet-900/20 rounded-2xl p-5">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Your Mix</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        {s.selected.length} highlight{s.selected.length === 1 ? "" : "s"} selected
                      </p>
                      {s.selected.length === 0 ? (
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                          Tick highlights from any card to build your custom trip.
                        </p>
                      ) : (
                        <ul className="space-y-1.5 mb-4">
                          {s.selected.map((h) => (
                            <li key={h} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <span className="text-violet-500">•</span>
                              <span className="flex-1">{h}</span>
                              <button onClick={() => toggleHighlight(h)} className="text-gray-400 hover:text-red-500">
                                ×
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      <button
                        disabled={s.selected.length === 0}
                        onClick={buildItinerary}
                        className="w-full bg-violet-600 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Build my trip →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3 — ITINERARY */}
          {s.step === 3 && (
            <div>
              {s.itineraryLoading && (
                <div className="space-y-4">
                  <div className="h-24 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                  <SkeletonCards count={3} />
                </div>
              )}
              {s.itineraryError && <ErrorBox message={s.itineraryError} onRetry={buildItinerary} />}
              {!s.itineraryLoading && !s.itineraryError && s.itinerary && (
                <ItineraryView itinerary={s.itinerary} />
              )}
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div className="p-5 sm:p-6 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              if (s.step === 1) set({ path: null });
              else if (s.step === 2) set({ step: 1, options: [], optionsError: null });
              else if (s.step === 3) set({ step: 2, itinerary: null, itineraryError: null });
            }}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            hidden={!s.path}
          >
            ← Back
          </button>

          <div className="ml-auto flex gap-3">
            {s.path && s.step === 1 && (
              <button
                onClick={fetchOptions}
                disabled={s.path === "B" && !s.destination.trim()}
                className="bg-violet-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Get trip options →
              </button>
            )}
            {s.step === 3 && s.itinerary && (
              <button
                onClick={onClose}
                className="bg-violet-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-violet-700 transition-colors"
              >
                Done — saved ✓
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
