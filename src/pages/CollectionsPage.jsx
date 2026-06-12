import { useState } from "react";
import { Link } from "react-router-dom";
import { useSocial } from "../context/SocialContext.jsx";
import Button from "../components/ui/Button.jsx";

export default function CollectionsPage() {
  const { collections, removeFromCollection, updateCollectionNote } = useSocial();
  const [editingId, setEditingId] = useState(null);
  const [noteText, setNoteText] = useState("");

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Collections</h1>
      <p className="mb-6 text-slate-500">Your favorite saved itineraries and notes</p>

      {collections.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <p className="text-slate-500">No saved itineraries yet.</p>
          <p className="mt-2 text-sm text-slate-400">
            Save trips from the Share tab on any trip detail page.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {collections.map((item) => {
            const trip = item.tripSnapshot;
            return (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h2 className="mb-1 text-lg font-semibold text-slate-900">
                  {trip?.title || "Untitled"}
                </h2>
                <p className="mb-3 text-sm text-slate-500">
                  {trip?.cities?.map((c) => c.name).join(" → ")}
                </p>

                {editingId === item.id ? (
                  <div className="mb-3 space-y-2">
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      placeholder="Your notes..."
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          updateCollectionNote(item.id, noteText);
                          setEditingId(null);
                        }}
                      >
                        Save note
                      </Button>
                      <Button variant="ghost" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="mb-3 text-sm text-slate-600 italic">
                    {item.note || "No notes yet"}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {trip?.id && (
                    <Link to={`/trip/${trip.id}`}>
                      <Button variant="secondary">Open trip</Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEditingId(item.id);
                      setNoteText(item.note || "");
                    }}
                  >
                    {item.note ? "Edit note" : "Add note"}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => removeFromCollection(item.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
