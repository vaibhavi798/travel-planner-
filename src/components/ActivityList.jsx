import { useState } from "react";

export default function ActivityList({ activities, onChange }) {
  const [input, setInput] = useState("");
  const [editingIdx, setEditingIdx] = useState(null);
  const [editValue, setEditValue] = useState("");

  function handleAdd(e) {
    e.preventDefault();
    if (!input.trim()) return;
    onChange([...activities, input.trim()]);
    setInput("");
  }

  function handleDelete(idx) {
    onChange(activities.filter((_, i) => i !== idx));
  }

  function startEdit(idx) {
    setEditingIdx(idx);
    setEditValue(activities[idx]);
  }

  function saveEdit(idx) {
    if (!editValue.trim()) return;
    const updated = activities.map((a, i) => (i === idx ? editValue.trim() : a));
    onChange(updated);
    setEditingIdx(null);
  }

  return (
    <div className="space-y-2">
      {activities.map((activity, idx) => (
        <div key={idx} className="flex items-center gap-2 group">
          <span className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0" />

          {editingIdx === idx ? (
            <input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => saveEdit(idx)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEdit(idx);
                if (e.key === "Escape") setEditingIdx(null);
              }}
              className="flex-1 border border-violet-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              autoFocus
            />
          ) : (
            <span
              onClick={() => startEdit(idx)}
              className="flex-1 text-sm text-gray-700 cursor-pointer hover:text-violet-700 transition-colors"
            >
              {activity}
            </span>
          )}

          <button
            onClick={() => handleDelete(idx)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 text-base leading-none"
          >
            ×
          </button>
        </div>
      ))}

      <form onSubmit={handleAdd} className="flex gap-2 mt-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add activity..."
          className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
        />
        <button
          type="submit"
          className="bg-violet-100 text-violet-700 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-violet-200 transition-colors"
        >
          + Add
        </button>
      </form>
    </div>
  );
}
