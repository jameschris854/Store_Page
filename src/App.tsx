import { Routes, Route } from "react-router";
import Home from "./pages/home";
import CollectionsPage from "./pages/Collections";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/collections/*" element={<CollectionsPage />} />
    </Routes>
  );
}
