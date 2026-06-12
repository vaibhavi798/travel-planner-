import { useNavigate } from "react-router-dom";
import { deleteTrip } from "../utils/localStorage";

const EMOJI_BG = ["bg-violet-100", "bg-sky-100", "bg-emerald-100", "bg-amber-100", "bg-rose-100"];
const EMOJI_TEXT = ["text-violet-600", "text-sky-600", "text-emerald-600", "text-amber-600", "text-rose-600"];

export default function TripCard({ trip, onDelete }) {
  const navigate = useNavigate();
  const colorIdx = trip.id % 5 || 0;

  function handleDelete(e) {
    e.stopPropagation();
    if (confirm(`Delete "${trip.name}"?`)) {
      deleteTrip(trip.id);
      onDelete();
    }
  }

  return (
    <div
      onClick={() => navigate(`/trip/${trip.id}`)}
      className="bg-white border border-gray-100 rounded-2xl p-5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`w-12 h-12 rounded-xl ${EMOJI_BG[colorIdx]} ${EMOJI_TEXT[colorIdx]} flex items-center justify-center text-2xl flex-shrink-0`}>
          ✈️
        </div>
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 text-lg leading-none p-1"
          title="Delete trip"
        >
          ×
        </button>
      </div>

      <h3 className="mt-3 font-semibold text-gray-900 text-lg leading-tight">{trip.name}</h3>

      <div className="mt-2 flex flex-wrap gap-2">
        <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-3 py-1">
          {trip.totalDays} {trip.totalDays === 1 ? "day" : "days"}
        </span>
        <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-3 py-1">
          {trip.cities.length} {trip.cities.length === 1 ? "city" : "cities"}
        </span>
        {trip.startDate && (
          <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-3 py-1">
            {new Date(trip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        )}
      </div>

      {trip.cities.length > 0 && (
        <p className="mt-3 text-sm text-gray-500 truncate">
          {trip.cities.map((c) => c.name).join(" → ")}
        </p>
      )}
    </div>
  );
}
