import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router'
import App from './App.tsx'
import { HelmetProvider } from "react-helmet-async";

const isLocalhost =
  location.hostname === "localhost" ||
  location.hostname === "127.0.0.1";

if (!isLocalhost) {
  // real users / production
  requestAnimationFrame(() => {
    document.body.classList.add("react-ready");
  });
}
createRoot(document.getElementById('root')!).render(
   <HelmetProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </HelmetProvider>
)
