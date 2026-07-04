import { useState } from "react";
import { saveTrip } from "../utils/api";

export default function TripForm({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [totalDays, setTotalDays] = useState(7);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || saving) return;

    const trip = {
      type: "manual",
      name: name.trim(),
      startDate: startDate || null,
      totalDays: Number(totalDays),
      cities: [],
      activitiesMap: {},
    };

    setSaving(true);
    try {
      await saveTrip(trip);
      onCreate();
      onClose();
    } catch {
      alert("Couldn't save the trip. Is the backend running?");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">New Trip</h2>
          <p className="text-sm text-gray-500 mt-1">Plan your next adventure</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Trip name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Europe Summer 2025"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Start date <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Number of days
            </label>
            <input
              type="number"
              min={1}
              max={90}
              value={totalDays}
              onChange={(e) => setTotalDays(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-violet-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-violet-700 transition-colors"
            >
              Create Trip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
