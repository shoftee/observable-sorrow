import {
  InjectionKey,
  onMounted,
  onUnmounted,
  reactive,
} from "@vue/runtime-dom";

export interface KeyboardEvents {
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
}

export const KeyboardEventsKey: InjectionKey<KeyboardEvents> =
  Symbol("KeyboardEvents");

export function useKeyboardEvents(): KeyboardEvents {
  const keys = reactive({
    ctrl: false,
    shift: false,
    alt: false,
  });

  const handler = (event: KeyboardEvent) => {
    keys.ctrl = event.ctrlKey;
    keys.shift = event.shiftKey;
    keys.alt = event.altKey;
  };

  onMounted(() => {
    addEventListener("keydown", handler);
    addEventListener("keyup", handler);
  });
  onUnmounted(() => {
    removeEventListener("keydown", handler);
    removeEventListener("keyup", handler);
  });

  return keys;
}
