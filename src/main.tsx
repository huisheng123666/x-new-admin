import { createRoot } from "react-dom/client";
import "@/assets/css/reset.css";
import "@/assets/css/base.scss";
import "nprogress/nprogress.css";
import App from "./App.tsx";
import { ThemeProvider } from "./context/theme.tsx";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
