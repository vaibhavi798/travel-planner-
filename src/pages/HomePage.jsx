import { Link } from "react-router-dom";
import { useTrips } from "../context/TripContext.jsx";
import Button from "../components/ui/Button.jsx";
import GlobeView from "../components/globe/GlobeView.jsx";

export default function HomePage() {
  const { trips, deleteTrip } = useTrips();
  const allCities = trips.flatMap((t) => t.cities);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Trips</h1>
          <p className="text-slate-500">Plan adventures and explore the globe</p>
        </div>
        <Link to="/new">
          <Button>+ New Trip</Button>
        </Link>
      </div>

      <div className="mb-8 h-64 lg:h-80">
        <GlobeView
          cities={allCities.slice(0, 20)}
          height="100%"
        />
      </div>

      {trips.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <p className="mb-4 text-slate-500">No trips yet. Create your first adventure!</p>
          <Link to="/new">
            <Button>Start planning</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-200 hover:shadow-md"
            >
              <Link to={`/trip/${trip.id}`}>
                <h2 className="mb-1 text-lg font-semibold text-slate-900 hover:text-sky-600">
                  {trip.title}
                </h2>
              </Link>
              <p className="mb-2 text-sm text-slate-500">
                {trip.totalDays} days · {trip.cities.map((c) => c.name).join(" → ") || "No cities"}
              </p>
              <p className="mb-4 text-xs text-slate-400">
                {trip.days?.length > 0
                  ? `${trip.days.length} days planned`
                  : "Not planned yet"}
              </p>
              <div className="flex gap-2">
                <Link to={`/trip/${trip.id}`} className="flex-1">
                  <Button variant="primary" className="w-full">
                    Open
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  onClick={() => {
                    if (confirm("Delete this trip?")) deleteTrip(trip.id);
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
