/**
 * Distribute totalDays across cities as evenly as possible.
 * Remainder days go to the first cities.
 *
 * Returns an array of { cityId, cityName, days: number }
 */
export function distributeDays(cities, totalDays) {
  if (!cities.length || totalDays <= 0) return [];

  const base = Math.floor(totalDays / cities.length);
  const remainder = totalDays % cities.length;

  return cities.map((city, i) => ({
    cityId: city.id,
    cityName: city.name,
    days: base + (i < remainder ? 1 : 0),
  }));
}

/**
 * Build a flat list of day entries: { dayNumber, cityId, cityName, activities[] }
 * Each day's activities are sourced from the trip's stored activities map.
 *
 * activitiesMap: { [cityId_dayIndex]: string[] }
 */
export function buildDayList(cities, totalDays, activitiesMap = {}) {
  const distribution = distributeDays(cities, totalDays);
  const days = [];
  let dayNumber = 1;

  for (const segment of distribution) {
    for (let d = 0; d < segment.days; d++) {
      const key = `${segment.cityId}_${d}`;
      days.push({
        dayNumber,
        cityId: segment.cityId,
        cityName: segment.cityName,
        dayIndex: d,
        key,
        activities: activitiesMap[key] || [],
      });
      dayNumber++;
    }
  }

  return days;
}
