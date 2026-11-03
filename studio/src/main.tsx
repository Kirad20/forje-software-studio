import { createRoot } from "react-dom/client";
import { App } from "./app/App.js";
import { applyTheme, savedTheme } from "./app/theme.js";
import "./styles.css";
import "./workspace.css";

applyTheme(savedTheme());
createRoot(document.getElementById("root")!).render(<App />);
