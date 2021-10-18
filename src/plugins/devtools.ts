import { reactive } from "vue";

export interface DevTools {
  on: boolean;
}

declare global {
  interface Window {
    __OS_DEVTOOLS__: DevTools;
  }
}

export default function applyDevTools(): void {
  if (!window.__OS_DEVTOOLS__) {
    window.__OS_DEVTOOLS__ = reactive({
      on: process.env.NODE_ENV === "development",
    });
  }
}
