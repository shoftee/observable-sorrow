<script setup lang="ts">
import { provide, ref } from "vue";
import { Endpoint } from "./app/endpoint";

import GameLoader from "./components/GameLoader.vue";
import Main from "./components/Main.vue"

import { EndpointKey } from "./composables/game-endpoint";
import { KeyboardEventsKey, getKeyboardEvents } from "./composables/keyboard-events";
provide(KeyboardEventsKey, getKeyboardEvents());

let endpoint = ref<Endpoint>();
provide(EndpointKey, endpoint);

let loaded = ref(false);
function onLoaded(ep: Endpoint) {
  loaded.value = true;
  endpoint.value = ep;
}
</script>

<template>
  <div class="app-container">
    <header>
      <div class="header-start d-flex gap-1 align-items-center">
        <div>Observable Sorrow</div>
        <div class="badge bg-success">
          <i class="bi bi-droplet"></i> &beta;
        </div>
      </div>
      <div class="header-middle"></div>
      <div class="header-end"></div>
    </header>
    <main unscrollable>
      <GameLoader v-if="!loaded" @loaded="onLoaded" />
      <Main v-else class="w-100 h-100" />
    </main>
    <footer>
      <div>
        Observable Sorrow is a clone of
        <a href="https://kittensgame.com/web/">Kittens Game</a>.
      </div>
    </footer>
  </div>
</template>