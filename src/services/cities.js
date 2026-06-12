/** Popular cities with lat/lng for globe markers */
export const CITIES = [
  { name: "Tokyo", lat: 35.6762, lng: 139.6503, country: "Japan" },
  { name: "Kyoto", lat: 35.0116, lng: 135.7681, country: "Japan" },
  { name: "Osaka", lat: 34.6937, lng: 135.5023, country: "Japan" },
  { name: "Paris", lat: 48.8566, lng: 2.3522, country: "France" },
  { name: "London", lat: 51.5074, lng: -0.1278, country: "UK" },
  { name: "New York", lat: 40.7128, lng: -74.006, country: "USA" },
  { name: "Los Angeles", lat: 34.0522, lng: -118.2437, country: "USA" },
  { name: "San Francisco", lat: 37.7749, lng: -122.4194, country: "USA" },
  { name: "Barcelona", lat: 41.3874, lng: 2.1686, country: "Spain" },
  { name: "Madrid", lat: 40.4168, lng: -3.7038, country: "Spain" },
  { name: "Rome", lat: 41.9028, lng: 12.4964, country: "Italy" },
  { name: "Florence", lat: 43.7696, lng: 11.2558, country: "Italy" },
  { name: "Venice", lat: 45.4408, lng: 12.3155, country: "Italy" },
  { name: "Amsterdam", lat: 52.3676, lng: 4.9041, country: "Netherlands" },
  { name: "Berlin", lat: 52.52, lng: 13.405, country: "Germany" },
  { name: "Munich", lat: 48.1351, lng: 11.582, country: "Germany" },
  { name: "Prague", lat: 50.0755, lng: 14.4378, country: "Czech Republic" },
  { name: "Vienna", lat: 48.2082, lng: 16.3738, country: "Austria" },
  { name: "Zurich", lat: 47.3769, lng: 8.5417, country: "Switzerland" },
  { name: "Istanbul", lat: 41.0082, lng: 28.9784, country: "Turkey" },
  { name: "Dubai", lat: 25.2048, lng: 55.2708, country: "UAE" },
  { name: "Singapore", lat: 1.3521, lng: 103.8198, country: "Singapore" },
  { name: "Bangkok", lat: 13.7563, lng: 100.5018, country: "Thailand" },
  { name: "Bali", lat: -8.3405, lng: 115.092, country: "Indonesia" },
  { name: "Sydney", lat: -33.8688, lng: 151.2093, country: "Australia" },
  { name: "Melbourne", lat: -37.8136, lng: 144.9631, country: "Australia" },
  { name: "Seoul", lat: 37.5665, lng: 126.978, country: "South Korea" },
  { name: "Hong Kong", lat: 22.3193, lng: 114.1694, country: "Hong Kong" },
  { name: "Taipei", lat: 25.033, lng: 121.5654, country: "Taiwan" },
  { name: "Beijing", lat: 39.9042, lng: 116.4074, country: "China" },
  { name: "Shanghai", lat: 31.2304, lng: 121.4737, country: "China" },
  { name: "Mumbai", lat: 19.076, lng: 72.8777, country: "India" },
  { name: "Delhi", lat: 28.7041, lng: 77.1025, country: "India" },
  { name: "Jaipur", lat: 26.9124, lng: 75.7873, country: "India" },
  { name: "Goa", lat: 15.2993, lng: 74.124, country: "India" },
  { name: "Cairo", lat: 30.0444, lng: 31.2357, country: "Egypt" },
  { name: "Marrakech", lat: 31.6295, lng: -7.9811, country: "Morocco" },
  { name: "Cape Town", lat: -33.9249, lng: 18.4241, country: "South Africa" },
  { name: "Rio de Janeiro", lat: -22.9068, lng: -43.1729, country: "Brazil" },
  { name: "Buenos Aires", lat: -34.6037, lng: -58.3816, country: "Argentina" },
  { name: "Mexico City", lat: 19.4326, lng: -99.1332, country: "Mexico" },
  { name: "Cancun", lat: 21.1619, lng: -86.8515, country: "Mexico" },
  { name: "Toronto", lat: 43.6532, lng: -79.3832, country: "Canada" },
  { name: "Vancouver", lat: 49.2827, lng: -123.1207, country: "Canada" },
  { name: "Reykjavik", lat: 64.1466, lng: -21.9426, country: "Iceland" },
  { name: "Lisbon", lat: 38.7223, lng: -9.1393, country: "Portugal" },
  { name: "Athens", lat: 37.9838, lng: 23.7275, country: "Greece" },
  { name: "Santorini", lat: 36.3932, lng: 25.4615, country: "Greece" },
  { name: "Hanoi", lat: 21.0285, lng: 105.8542, country: "Vietnam" },
  { name: "Ho Chi Minh City", lat: 10.8231, lng: 106.6297, country: "Vietnam" },
];

export function findCity(name) {
  if (!name) return null;
  const normalized = name.trim().toLowerCase();
  return (
    CITIES.find((c) => c.name.toLowerCase() === normalized) ||
    CITIES.find((c) => c.name.toLowerCase().includes(normalized)) ||
    null
  );
}

export function searchCities(query) {
  if (!query) return CITIES.slice(0, 8);
  const q = query.toLowerCase();
  return CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q),
  ).slice(0, 8);
}
