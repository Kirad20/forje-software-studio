import { createRoot } from "react-dom/client";
import { App } from "./App";
import { applyTheme, savedTheme } from "./theme";
import "./styles.css";
import "./workspace.css";

applyTheme(savedTheme());
createRoot(document.getElementById("root")!).render(<App />);
