import { LogItem } from "@/app/presenters";
import { onMounted, onUnmounted } from "vue";

export function useKeyboardEvent(
  event: "keyup" | "keydown" | "keypress",
  listener: (e: KeyboardEvent) => void,
): void {
  onMounted(() => addEventListener(event, listener));
  onUnmounted(() => removeEventListener(event, listener));
}

export function useLogItemEvent(
  listener: (e: CustomEvent<LogItem>) => void,
): void {
  onMounted(() => document.addEventListener("onlogmessage", listener));
  onUnmounted(() => document.removeEventListener("onlogmessage", listener));
}
