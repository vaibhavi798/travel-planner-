import { useState } from "react";
import { useSocial } from "../context/SocialContext.jsx";
import { useTrips } from "../context/TripContext.jsx";
import Button from "../components/ui/Button.jsx";

export default function FriendsPage() {
  const { friends, addFriend, updateFriend, addPost, posts, findNearbyTravelers } =
    useSocial();
  const { trips } = useTrips();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [postCaption, setPostCaption] = useState("");
  const [postCity, setPostCity] = useState("");
  const [postAuthor, setPostAuthor] = useState("You");
  const [nearbyCity, setNearbyCity] = useState("");

  const activeTrip = trips[0];
  const nearby = nearbyCity
    ? findNearbyTravelers(nearbyCity)
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Friends & Social</h1>
      <p className="mb-6 text-slate-500">
        Track friends, share photos, and find travelers in the same place
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-slate-900">Friend activity</h2>
          <form
            className="mb-4 flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim()) return;
              addFriend(name.trim(), city.trim(), "traveling");
              setName("");
              setCity("");
            }}
          >
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Friend name"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Current city"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <Button type="submit">Add friend</Button>
          </form>

          {friends.length === 0 ? (
            <p className="text-sm text-slate-500">No friends added yet.</p>
          ) : (
            <ul className="space-y-2">
              {friends.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                >
                  <div>
                    <span className="font-medium">{f.name}</span>
                    {f.currentCity && (
                      <span className="ml-2 text-sky-600">📍 {f.currentCity}</span>
                    )}
                    <span className="ml-2 text-xs text-slate-400">{f.status}</span>
                  </div>
                  <select
                    value={f.status}
                    onChange={(e) => updateFriend(f.id, { status: e.target.value })}
                    className="rounded border border-slate-200 px-2 py-1 text-xs"
                  >
                    <option value="planning">Planning</option>
                    <option value="traveling">Traveling now</option>
                    <option value="home">Home</option>
                  </select>
                </li>
              ))}
            </ul>
          )}

          {activeTrip && (
            <p className="mt-4 text-xs text-slate-400">
              Your active trip: {activeTrip.title} — set status to &quot;traveling&quot; when you go!
            </p>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-slate-900">Travel photos</h2>
          <form
            className="mb-4 space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!postCaption.trim() || !postCity.trim()) return;
              addPost({
                author: postAuthor,
                city: postCity.trim(),
                caption: postCaption.trim(),
              });
              setPostCaption("");
            }}
          >
            <input
              type="text"
              value={postAuthor}
              onChange={(e) => setPostAuthor(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={postCity}
              onChange={(e) => setPostCity(e.target.value)}
              placeholder="City"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <textarea
              value={postCaption}
              onChange={(e) => setPostCaption(e.target.value)}
              placeholder="Caption for your travel moment..."
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <Button type="submit" className="w-full">
              Post update
            </Button>
          </form>

          <ul className="space-y-3">
            {posts.map((p) => (
              <li key={p.id} className="rounded-lg bg-slate-50 p-3 text-sm">
                <p className="font-medium text-slate-900">
                  {p.author} · 📍 {p.city}
                </p>
                <p className="text-slate-600">{p.caption}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(p.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
            {posts.length === 0 && (
              <p className="text-sm text-slate-500">No posts yet.</p>
            )}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <h2 className="mb-4 font-semibold text-slate-900">
            Travelers in the same place
          </h2>
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={nearbyCity}
              onChange={(e) => setNearbyCity(e.target.value)}
              placeholder="Enter a city (e.g. Tokyo)"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          {nearbyCity && nearby.length === 0 && (
            <p className="text-sm text-slate-500">
              No shared itineraries found for {nearbyCity}. Publish trips to Explore to connect!
            </p>
          )}
          <ul className="space-y-2">
            {nearby.map((entry) => (
              <li
                key={entry.id}
                className="rounded-lg border border-sky-100 bg-sky-50 px-4 py-3 text-sm"
              >
                <span className="font-medium">{entry.author}</span> is planning{" "}
                <span className="text-sky-700">{entry.title}</span> ({entry.totalDays} days)
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
