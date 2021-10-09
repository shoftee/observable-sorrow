<script setup lang="ts">
import { defineAsyncComponent, provide } from "vue";

import { KeyboardEventsKey, getKeyboardEvents } from "./composables/keyboard-events";
provide(KeyboardEventsKey, getKeyboardEvents());

const Main = defineAsyncComponent(() => import("./components/Main.vue"))
</script>

<template>
  <div class="w-100 h-100 d-flex flex-column">
    <header class="d-flex flex-row align-items-center justify-content-start gap-1">
      <div>Observable Sorrow</div>
      <div class="badge bg-success">
        <i class="bi bi-droplet"></i> &beta;
      </div>
    </header>
    <Suspense>
      <template #default>
        <main class="h-100 scrollable d-flex flex-column align-items-center">
          <ul class="nav nav-tabs justify-content-center">
            <li class="nav-item">
              <button class="nav-link active">Bonfire</button>
            </li>
          </ul>
          <Main class="w-100" />
        </main>
      </template>
      <template #fallback>
        <div class="h-100 scrollable d-flex align-items-center justify-content-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      </template>
    </Suspense>
    <footer class="d-flex flex-row justify-content-end">
      <div>
        Observable Sorrow is a clone of
        <a href="https://kittensgame.com/web/">Kittens Game</a>.
      </div>
    </footer>
  </div>
</template>