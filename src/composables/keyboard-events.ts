import {
  inject,
  InjectionKey,
  onMounted,
  onUnmounted,
  provide,
  reactive,
  readonly,
} from "vue";

export interface KeyboardEvents {
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
}

const KeyboardEventsKey: InjectionKey<KeyboardEvents> =
  Symbol("KeyboardEvents");

export function provideKeyboardEvents() {
  provide(KeyboardEventsKey, getKeyboardEvents());
}

export function useKeyboardEvents() {
  return inject(KeyboardEventsKey)!;
}

function getKeyboardEvents(): KeyboardEvents {
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
  const reset = () => {
    if (document.visibilityState === "hidden") {
      keys.ctrl = false;
      keys.shift = false;
      keys.alt = false;
    }
  };

  onMounted(() => {
    addEventListener("keydown", handler);
    addEventListener("keyup", handler);
    document.addEventListener("visibilitychange", reset);
  });

  onUnmounted(() => {
    removeEventListener("keydown", handler);
    removeEventListener("keyup", handler);
    document.removeEventListener("visibilitychange", reset);
  });

  return readonly(keys);
}
