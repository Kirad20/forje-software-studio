import { createRoot } from "react-dom/client";
import { App } from "./app/App.js";
import { Pwa, PwaBoundary } from "./app/Pwa.js";
import { applyTheme, savedTheme } from "./app/theme.js";
import "./styles.css";
import "./workspace.css";

applyTheme(savedTheme());
createRoot(document.getElementById("root")!).render(<Pwa><PwaBoundary><App /></PwaBoundary></Pwa>);
