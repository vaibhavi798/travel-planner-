// Renders a full generated itinerary object (the shape returned by the
// second Gemini call). Used both in the wizard's final step and when
// reopening a saved AI trip from the home page.

function ActivityRow({ item }) {
  return (
    <div className="flex gap-3">
      <div className="text-xs font-semibold text-violet-600 dark:text-violet-300 w-16 flex-shrink-0 pt-0.5">
        {item.time}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.activity}</p>
        {item.location && (
          <p className="text-xs text-gray-500 dark:text-gray-400">📍 {item.location}</p>
        )}
        {item.notes && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{item.notes}</p>
        )}
      </div>
    </div>
  );
}

function Block({ label, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide font-semibold text-gray-400 dark:text-gray-500 mb-2">
        {label}
      </p>
      <div className="space-y-3">
        {items.map((item, i) => (
          <ActivityRow key={i} item={item} />
        ))}
      </div>
    </div>
  );
}

export default function ItineraryView({ itinerary }) {
  if (!itinerary) return null;
  const {
    tripName, destination, days = [], hotelSuggestions = [], packingTips = [],
    estimatedTotalBudget, budgetBreakdown, cashToCarry, dailyBudgetCap,
  } = itinerary;

  const breakdownRows = budgetBreakdown
    ? [
        ["Accommodation", budgetBreakdown.accommodation],
        ["Food", budgetBreakdown.food],
        ["Activities", budgetBreakdown.activities],
        ["Transport", budgetBreakdown.transport],
        ["Misc buffer", budgetBreakdown.miscBuffer],
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 p-6 text-white">
        <h2 className="text-2xl font-bold">{tripName}</h2>
        <p className="text-violet-100 mt-1">📍 {destination}</p>
        {estimatedTotalBudget && (
          <span className="inline-block mt-3 text-xs bg-white/20 rounded-full px-3 py-1">
            Est. budget: {estimatedTotalBudget}
          </span>
        )}
      </div>

      {/* Days */}
      <div className="space-y-4">
        {days.map((day) => (
          <div
            key={day.day}
            className="border border-gray-100 dark:border-gray-700 rounded-2xl p-5 bg-white dark:bg-gray-800"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {day.day}
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500 font-medium">
                  Day {day.day}
                </p>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{day.theme}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Block label="Morning" items={day.morning} />
              <Block label="Afternoon" items={day.afternoon} />
              <Block label="Evening" items={day.evening} />
            </div>

            {day.food && day.food.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-[11px] uppercase tracking-wide font-semibold text-gray-400 dark:text-gray-500 mb-2">
                  Food
                </p>
                <div className="flex flex-wrap gap-2">
                  {day.food.map((f, i) => (
                    <span
                      key={i}
                      className="text-xs bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-full px-3 py-1"
                    >
                      🍽️ {f.meal}: {f.name} · {f.cuisine} · {f.priceRange}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {day.tips && (
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/40 rounded-lg px-3 py-2">
                💡 {day.tips}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Extras */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hotelSuggestions.length > 0 && (
          <div className="border border-gray-100 dark:border-gray-700 rounded-2xl p-5 bg-white dark:bg-gray-800">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">🏨 Where to stay</h4>
            <ul className="space-y-1">
              {hotelSuggestions.map((h, i) => (
                <li key={i} className="text-sm text-gray-600 dark:text-gray-300">• {h}</li>
              ))}
            </ul>
          </div>
        )}
        {packingTips.length > 0 && (
          <div className="border border-gray-100 dark:border-gray-700 rounded-2xl p-5 bg-white dark:bg-gray-800">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">🧳 Packing tips</h4>
            <ul className="space-y-1">
              {packingTips.map((t, i) => (
                <li key={i} className="text-sm text-gray-600 dark:text-gray-300">• {t}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Budget & cash */}
      {(budgetBreakdown || cashToCarry || dailyBudgetCap) && (
        <div className="space-y-4">
          {dailyBudgetCap && (
            <div className="border border-gray-100 dark:border-gray-700 rounded-2xl p-5 bg-white dark:bg-gray-800 flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">📅 Daily budget cap</h4>
              <span className="text-sm font-medium text-violet-600 dark:text-violet-300">{dailyBudgetCap}</span>
            </div>
          )}

          {breakdownRows.length > 0 && (
            <div className="border border-gray-100 dark:border-gray-700 rounded-2xl p-5 bg-white dark:bg-gray-800">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">💷 Budget breakdown</h4>
              <ul className="space-y-2">
                {breakdownRows.map(([label, value]) => (
                  <li key={label} className="flex items-start justify-between gap-4 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{label}</span>
                    <span className="text-gray-900 dark:text-gray-100 text-right">{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {cashToCarry && (
            <div className="border border-amber-200 dark:border-amber-900 rounded-2xl p-5 bg-amber-50 dark:bg-amber-900/20">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                💵 Cash to carry: <span className="text-amber-700 dark:text-amber-300">{cashToCarry.amount}</span>
              </h4>
              {cashToCarry.reason && (
                <p className="text-sm text-gray-600 dark:text-gray-300">{cashToCarry.reason}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
