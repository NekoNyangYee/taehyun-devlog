declare module "*.css";

interface HljsAPI {
  highlightAll: () => void;
  highlightElement: (el: HTMLElement) => void;
}

declare global {
  interface Window {
    hljs?: HljsAPI;
  }
}

export {};
