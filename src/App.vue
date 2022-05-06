<script setup lang="ts">
import { defineAsyncComponent, provide, ref } from "vue";
import { Endpoint, Setup } from "./app/endpoint";

import { EndpointKey } from "./composables/game-endpoint";
import {
  KeyboardEventsKey,
  getKeyboardEvents,
} from "./composables/keyboard-events";
provide(KeyboardEventsKey, getKeyboardEvents());

let endpoint = ref<Endpoint>();
provide(EndpointKey, endpoint);

const Main = defineAsyncComponent(async () => {
  endpoint.value = await Setup();
  return import("./components/Main.vue");
});
</script>

<template>
  <div class="app-container">
    <header class="row">
      <div class="col">
        <div class="header-start d-flex gap-1 align-items-center">
          <div>Observable Sorrow</div>
          <div class="badge bg-success">
            <i class="bi bi-droplet"></i> &beta;
          </div>
        </div>
      </div>
      <div class="col">
        <div class="header-middle"></div>
      </div>
      <div class="col">
        <div class="header-end"></div>
      </div>
    </header>
    <main unscrollable>
      <Suspense>
        <template #default>
          <Main class="w-100 h-100" />
        </template>
        <template #fallback>
          <div class="loader">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
        </template>
      </Suspense>
    </main>
    <footer>
      <div>
        Observable Sorrow is a clone of
        <a href="https://kittensgame.com/web/">Kittens Game</a>.
      </div>
    </footer>
  </div>
</template>
