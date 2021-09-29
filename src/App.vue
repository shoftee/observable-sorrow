<template>
  <div class="w-100 h-100 d-flex flex-column">
    <header
      class="d-flex flex-row align-items-center justify-content-start gap-1"
    >
      <div>Observable Sorrow</div>
      <div class="badge bg-success"><i class="bi bi-droplet"></i> &beta;</div>
    </header>
    <main class="h-100 scrollable d-flex justify-content-center">
      <os-main class="w-100" />
    </main>
    <footer class="d-flex flex-row justify-content-end">
      <div>
        Observable Sorrow is a clone of
        <a href="https://kittensgame.com/web/">Kittens Game</a>.
      </div>
    </footer>
  </div>
</template>

<script lang="ts">
import { Interactor } from "./app/os";
import {
  useKeyboardEvents,
  KeyboardEventsKey,
} from "./composables/keyboard-events";

import { defineComponent, onMounted, provide } from "vue";

import Main from "./components/Main.vue";
export default defineComponent({
  components: { "os-main": Main },
  setup() {
    onMounted(() => Interactor.runner.start());

    provide(KeyboardEventsKey, useKeyboardEvents());
  },
});
</script>
