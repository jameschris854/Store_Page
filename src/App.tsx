import { Routes, Route } from "react-router";
import Home from "./pages/home";
import CollectionsPage from "./pages/Collections";
import { useLayoutEffect } from "react";


const isLocalhost =
  location.hostname === "localhost" ||
  location.hostname === "127.0.0.1";

export default function App() {

  useLayoutEffect(() => {
    // 🚨 Puppeteer runs on localhost → stay hidden
    if (!isLocalhost) {
      document.body.style.visibility = "visible";
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/collections/*" element={<CollectionsPage />} />
    </Routes>
  );
}
