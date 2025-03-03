// import { animatePage } from "../utils";

export function setCssTheme(type: "dark" | "light") {
  const root = document.querySelector(":root") as HTMLElement;
  // animatePage();
  if (type === "light") {
    root.style.setProperty("--background", "hsl(216 20.11% 95.47%)");
    root.style.setProperty("--foreground", "#171717");
    root.style.setProperty("--blockbg", "#fff");
    root.style.setProperty("--blockborder", "hsl(240 5.9% 90%)");
    root.style.setProperty("--login-bg", "hsl(216 20.11% 95.47%)");
  } else {
    root.style.setProperty("--background", "#0a0a0a");
    root.style.setProperty("--foreground", "#ededed");
    root.style.setProperty("--blockbg", "#141414");
    root.style.setProperty("--blockborder", "#303030");
    root.style.setProperty("--login-bg", "#14161A");
  }
}

export function getSysTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export const darkStyleText = `
        @media (prefers-color-scheme: dark) {
          :root {
            --background: #0a0a0a !important;
            --foreground: #ededed !important;
            --blockbg: #141414 !important;
            --blockborder: #303030 !important;
            --login-bg: #14161A !important;
          }
      }
      `;
