import { Link } from "react-router-dom";
import TripWizard from "../components/trip/TripWizard.jsx";
import GlobeView from "../components/globe/GlobeView.jsx";

export default function NewTripPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Link to="/" className="mb-4 inline-block text-sm text-sky-600 hover:underline">
        ← Back to trips
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Create a new trip</h1>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <TripWizard />
        </div>
        <div className="lg:col-span-3">
          <GlobeView cities={[]} height={400} />
          <p className="mt-3 text-center text-sm text-slate-500">
            Your route will appear here as you add cities
          </p>
        </div>
      </div>
    </div>
  );
}
