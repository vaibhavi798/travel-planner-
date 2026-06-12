import { useState } from "react";
import { useSocial } from "../context/SocialContext.jsx";
import { useTrips } from "../context/TripContext.jsx";
import Button from "../components/ui/Button.jsx";

export default function ExplorePage() {
  const { sharedItineraries, addComment } = useSocial();
  const { importTrip } = useTrips();
  const [commentText, setCommentText] = useState({});
  const [author, setAuthor] = useState("You");

  function handleImport(entry) {
    importTrip({
      title: `${entry.title} (copy)`,
      cities: entry.cities,
      totalDays: entry.totalDays,
      days: entry.days,
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Explore</h1>
      <p className="mb-6 text-slate-500">
        Browse shared itineraries from other travelers
      </p>

      {sharedItineraries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <p className="text-slate-500">No shared itineraries yet.</p>
          <p className="mt-2 text-sm text-slate-400">
            Publish a trip from its Share tab to appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sharedItineraries.map((entry) => (
            <article
              key={entry.id}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{entry.title}</h2>
                  <p className="text-sm text-slate-500">
                    by {entry.author} · {entry.totalDays} days ·{" "}
                    {entry.cities?.map((c) => c.name).join(" → ")}
                  </p>
                </div>
                <Button variant="secondary" onClick={() => handleImport(entry)}>
                  Copy to my trips
                </Button>
              </div>

              {entry.days?.length > 0 && (
                <ul className="mb-4 space-y-1 text-sm text-slate-600">
                  {entry.days.slice(0, 3).map((d) => (
                    <li key={d.dayNumber}>
                      Day {d.dayNumber} ({d.city}): {d.title || d.activities?.[0]?.name}
                    </li>
                  ))}
                  {entry.days.length > 3 && (
                    <li className="text-slate-400">+ {entry.days.length - 3} more days</li>
                  )}
                </ul>
              )}

              <div className="border-t border-slate-100 pt-4">
                <p className="mb-2 text-sm font-medium text-slate-700">Comments</p>
                {(entry.comments || []).map((c) => (
                  <p key={c.id} className="mb-1 text-sm text-slate-600">
                    <span className="font-medium">{c.author}:</span> {c.text}
                  </p>
                ))}
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={commentText[entry.id] || ""}
                    onChange={(e) =>
                      setCommentText((prev) => ({ ...prev, [entry.id]: e.target.value }))
                    }
                    placeholder="Add a comment..."
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                  <Button
                    onClick={() => {
                      const text = commentText[entry.id]?.trim();
                      if (!text) return;
                      addComment(entry.id, author, text);
                      setCommentText((prev) => ({ ...prev, [entry.id]: "" }));
                    }}
                  >
                    Post
                  </Button>
                </div>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Your name"
                  className="mt-2 w-full rounded-lg border border-slate-200 px-2 py-1 text-xs"
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
