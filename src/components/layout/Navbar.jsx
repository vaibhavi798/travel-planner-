import { Link, useLocation } from "react-router-dom";

const links = [
  { to: "/", label: "My Trips" },
  { to: "/explore", label: "Explore" },
  { to: "/collections", label: "Collections" },
  { to: "/friends", label: "Friends" },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl">🌍</span>
          <span className="text-lg font-bold text-slate-900">WanderGlobe</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1 sm:gap-2">
          {links.map((link) => {
            const active = pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? "bg-sky-50 text-sky-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            to="/new"
            className="ml-1 rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-700"
          >
            + New Trip
          </Link>
        </nav>
      </div>
    </header>
  );
}
