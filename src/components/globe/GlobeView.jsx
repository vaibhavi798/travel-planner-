import { useEffect, useMemo, useRef } from "react";
import Globe from "react-globe.gl";

const EARTH_IMAGE =
  "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg";
const SKY_IMAGE =
  "//unpkg.com/three-globe/example/img/night-sky.png";

export default function GlobeView({
  cities = [],
  selectedCity = null,
  onCityClick,
  height = "100%",
}) {
  const globeRef = useRef();

  const pointsData = useMemo(
    () =>
      cities.map((city, index) => ({
        ...city,
        lat: city.lat,
        lng: city.lng,
        size: selectedCity === city.name ? 1.2 : 0.6,
        color: selectedCity === city.name ? "#38bdf8" : "#f97316",
        label: city.name,
        index,
      })),
    [cities, selectedCity],
  );

  const arcsData = useMemo(() => {
    const arcs = [];
    for (let i = 0; i < cities.length - 1; i++) {
      arcs.push({
        startLat: cities[i].lat,
        startLng: cities[i].lng,
        endLat: cities[i + 1].lat,
        endLng: cities[i + 1].lng,
        color: ["#38bdf8", "#818cf8"],
      });
    }
    return arcs;
  }, [cities]);

  useEffect(() => {
    if (!globeRef.current || cities.length === 0) return;
    const target = selectedCity
      ? cities.find((c) => c.name === selectedCity) || cities[0]
      : cities[0];
    if (target) {
      globeRef.current.pointOfView(
        { lat: target.lat, lng: target.lng, altitude: 1.8 },
        1200,
      );
    }
  }, [selectedCity, cities]);

  return (
    <div
      className="relative overflow-hidden rounded-xl bg-slate-900"
      style={{ height, minHeight: 320 }}
    >
      <Globe
        ref={globeRef}
        globeImageUrl={EARTH_IMAGE}
        backgroundImageUrl={SKY_IMAGE}
        pointsData={pointsData}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointAltitude={0.02}
        pointRadius="size"
        pointLabel={(d) => d.label}
        onPointClick={(point) => onCityClick?.(point.label)}
        arcsData={arcsData}
        arcColor="color"
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={2000}
        arcStroke={0.5}
        atmosphereColor="#38bdf8"
        atmosphereAltitude={0.15}
      />
      {cities.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="rounded-lg bg-slate-900/70 px-4 py-2 text-sm text-slate-300">
            Add cities to see your route on the globe
          </p>
        </div>
      )}
    </div>
  );
}
