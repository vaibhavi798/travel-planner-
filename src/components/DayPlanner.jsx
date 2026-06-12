import ActivityList from "./ActivityList";

const CITY_COLORS = [
  "border-l-violet-400 bg-violet-50",
  "border-l-sky-400 bg-sky-50",
  "border-l-emerald-400 bg-emerald-50",
  "border-l-amber-400 bg-amber-50",
  "border-l-rose-400 bg-rose-50",
];

const CITY_BADGE = [
  "bg-violet-100 text-violet-700",
  "bg-sky-100 text-sky-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
];

export default function DayPlanner({ days, cityIndexMap, onActivitiesChange }) {
  return (
    <div className="space-y-4">
      {days.map((day) => {
        const colorIdx = (cityIndexMap[day.cityId] || 0) % 5;

        return (
          <div
            key={day.key}
            className={`border-l-4 rounded-r-2xl p-5 ${CITY_COLORS[colorIdx]}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white rounded-xl w-10 h-10 flex items-center justify-center shadow-sm text-sm font-bold text-gray-700">
                {day.dayNumber}
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Day {day.dayNumber}</p>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{day.cityName}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CITY_BADGE[colorIdx]}`}>
                    Day {day.dayIndex + 1} in city
                  </span>
                </div>
              </div>
            </div>

            <ActivityList
              activities={day.activities}
              onChange={(updated) => onActivitiesChange(day.key, updated)}
            />
          </div>
        );
      })}
    </div>
  );
}
