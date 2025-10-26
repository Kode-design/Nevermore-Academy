import "./styles.css";
import { GameApp } from "./ui/gameApp.js";

const root = document.getElementById("app");

if (!root) {
  throw new Error("#app container missing from document");
}

const app = new GameApp(root);

// Attach to window for quick debugging in the browser console.
window.nevermore = app;
