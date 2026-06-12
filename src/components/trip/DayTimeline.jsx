export default function DayTimeline({ days = [], selectedCity = null }) {
  if (!days || days.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
        No itinerary yet. Generate AI plans or add activities manually.
      </div>
    );
  }

  const filtered =
    selectedCity && selectedCity !== "all"
      ? days.filter((d) => d.city?.toLowerCase() === selectedCity.toLowerCase())
      : days;

  return (
    <div className="space-y-4">
      {filtered.map((day) => (
        <div
          key={day.dayNumber}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-semibold text-slate-900">
              Day {day.dayNumber}
              {day.city && (
                <span className="ml-2 text-sm font-normal text-sky-600">
                  {day.city}
                </span>
              )}
            </h4>
            {day.title && (
              <span className="text-xs text-slate-500">{day.title}</span>
            )}
          </div>
          <ul className="space-y-2">
            {(day.activities || []).map((act, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm"
              >
                {act.time && (
                  <span className="shrink-0 font-mono text-xs text-slate-400">
                    {act.time}
                  </span>
                )}
                <div>
                  <p className="font-medium text-slate-800">{act.name}</p>
                  {act.description && (
                    <p className="text-slate-500">{act.description}</p>
                  )}
                </div>
              </li>
            ))}
            {(!day.activities || day.activities.length === 0) && (
              <li className="text-sm text-slate-400">No activities listed</li>
            )}
          </ul>
        </div>
      ))}
    </div>
  );
}
