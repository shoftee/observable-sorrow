<script setup lang="ts">
import { provide, ref } from "vue";
import { Channel } from "./app/os";

import GameLoader from "./components/GameLoader.vue";
import Main from "./components/Main.vue"

import { ChannelKey } from "./composables/game-channel";
import { KeyboardEventsKey, getKeyboardEvents } from "./composables/keyboard-events";
provide(KeyboardEventsKey, getKeyboardEvents());

let channel = ref<Channel>();
provide(ChannelKey, channel);

let loaded = ref(false);
function onLoaded(c: Channel) {
  loaded.value = true;
  channel.value = c;
}
</script>

<template>
  <div class="app-container">
    <header class="gap-1">
      <div>Observable Sorrow</div>
      <div class="badge bg-success">
        <i class="bi bi-droplet"></i> &beta;
      </div>
    </header>
    <main class="scrollable">
      <GameLoader v-if="!loaded" @loaded="onLoaded" />
      <Main v-else class="w-100 h-100" />
    </main>
    <footer class="gap-1">
      <div>
        Observable Sorrow is a clone of
        <a href="https://kittensgame.com/web/">Kittens Game</a>.
      </div>
    </footer>
  </div>
</template>