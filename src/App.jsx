import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import TripDetails from "./pages/TripDetails.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/trip/:id" element={<TripDetails />} />
    </Routes>
  );
}
