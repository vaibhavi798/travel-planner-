/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

const SocialContext = createContext(null);
const COLLECTIONS_KEY = "wanderglobe_collections";
const SHARED_KEY = "wanderglobe_shared_itineraries";
const FRIENDS_KEY = "wanderglobe_friends";
const POSTS_KEY = "wanderglobe_posts";

export function SocialProvider({ children }) {
  const [collections, setCollections] = useState(() => load(COLLECTIONS_KEY, []));
  const [sharedItineraries, setSharedItineraries] = useState(() => load(SHARED_KEY, []));
  const [friends, setFriends] = useState(() => load(FRIENDS_KEY, []));
  const [posts, setPosts] = useState(() => load(POSTS_KEY, []));

  useEffect(() => save(COLLECTIONS_KEY, collections), [collections]);
  useEffect(() => save(SHARED_KEY, sharedItineraries), [sharedItineraries]);
  useEffect(() => save(FRIENDS_KEY, friends), [friends]);
  useEffect(() => save(POSTS_KEY, posts), [posts]);

  function saveToCollection(trip, note = "") {
    setCollections((prev) => {
      if (prev.some((c) => c.tripId === trip.id)) return prev;
      return [
        {
          id: crypto.randomUUID(),
          tripId: trip.id,
          tripSnapshot: trip,
          note,
          savedAt: new Date().toISOString(),
        },
        ...prev,
      ];
    });
  }

  function removeFromCollection(collectionId) {
    setCollections((prev) => prev.filter((c) => c.id !== collectionId));
  }

  function updateCollectionNote(collectionId, note) {
    setCollections((prev) =>
      prev.map((c) => (c.id === collectionId ? { ...c, note } : c)),
    );
  }

  function publishItinerary(trip) {
    const entry = {
      id: crypto.randomUUID(),
      tripId: trip.id,
      title: trip.title,
      cities: trip.cities,
      totalDays: trip.totalDays,
      days: trip.days,
      author: trip.travelers[0]?.name || "Traveler",
      publishedAt: new Date().toISOString(),
      comments: [],
    };
    setSharedItineraries((prev) => [entry, ...prev]);
    return entry;
  }

  function addComment(sharedId, author, text) {
    setSharedItineraries((prev) =>
      prev.map((s) =>
        s.id === sharedId
          ? {
              ...s,
              comments: [
                ...s.comments,
                { id: crypto.randomUUID(), author, text, at: new Date().toISOString() },
              ],
            }
          : s,
      ),
    );
  }

  function addFriend(name, currentCity = "", status = "planning") {
    setFriends((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name,
        currentCity,
        status,
        updatedAt: new Date().toISOString(),
      },
    ]);
  }

  function updateFriend(id, updates) {
    setFriends((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f,
      ),
    );
  }

  function addPost({ author, city, caption, imageUrl = "" }) {
    setPosts((prev) => [
      {
        id: crypto.randomUUID(),
        author,
        city,
        caption,
        imageUrl,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  }

  function findNearbyTravelers(city) {
    return sharedItineraries.filter((s) =>
      s.cities.some((c) => c.name.toLowerCase() === city?.toLowerCase()),
    );
  }

  return (
    <SocialContext.Provider
      value={{
        collections,
        sharedItineraries,
        friends,
        posts,
        saveToCollection,
        removeFromCollection,
        updateCollectionNote,
        publishItinerary,
        addComment,
        addFriend,
        updateFriend,
        addPost,
        findNearbyTravelers,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
}

export function useSocial() {
  const ctx = useContext(SocialContext);
  if (!ctx) throw new Error("useSocial must be used within SocialProvider");
  return ctx;
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
