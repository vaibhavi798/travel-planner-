import { useState } from "react";
import { useTrips } from "../../context/TripContext.jsx";
import Button from "../ui/Button.jsx";

export default function TravelerList({ trip }) {
  const { updateTrip } = useTrips();
  const [name, setName] = useState("");
  const travelers = trip.travelers || [];

  function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    if (travelers.some((t) => t.name.toLowerCase() === name.trim().toLowerCase())) {
      setName("");
      return;
    }
    updateTrip(trip.id, {
      travelers: [...travelers, { id: crypto.randomUUID(), name: name.trim() }],
    });
    setName("");
  }

  function handleRemove(id) {
    if (travelers.length <= 1) return;
    updateTrip(trip.id, {
      travelers: travelers.filter((t) => t.id !== id),
    });
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-slate-900">Travelers</h3>
      <ul className="space-y-2">
        {travelers.map((t) => (
          <li
            key={t.id}
            className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
          >
            <span>{t.name}</span>
            {travelers.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemove(t.id)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add companion name"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
        <Button type="submit">Add</Button>
      </form>
    </div>
  );
}
