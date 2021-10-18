import { onMounted, onUnmounted } from "vue";

export function useKeyboardEvent(
  event: "keyup" | "keydown" | "keypress",
  listener: (e: KeyboardEvent) => void,
): void {
  onMounted(() => addEventListener(event, listener));
  onUnmounted(() => removeEventListener(event, listener));
}
