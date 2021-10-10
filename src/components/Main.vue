<script setup lang="ts">
import { onMounted } from "vue";

import Resources from "./Resource/List.vue";
import Environment from "./Environment.vue";
import History from "./History.vue";
import BonfireControls from "./Controls/Bonfire.vue";

import { injectChannel } from "@/composables/game-channel";

const channel = injectChannel();

onMounted(async () => {
  // Start the game
  await channel.interactors.controller.start();
})
</script>

<template>
  <div class="nav-container scrollable">
    <ul class="nav nav-tabs">
      <li class="nav-item">
        <button class="nav-link active">Bonfire</button>
      </li>
      <li class="nav-item">
        <button class="nav-link">
          Village
          <div class="badge bg-primary">
            <span class="number">123.456K</span>
          </div>
        </button>
      </li>
    </ul>
    <div class="main-container scrollable">
      <div class="scrollable col p-2 pe-1">
        <Resources />
      </div>
      <div class="scrollable col-5 py-2 px-1">
        <div>
          <BonfireControls />
        </div>
      </div>
      <div class="env-container scrollable col p-2 ps-1 gap-2">
        <div>
          <Environment />
        </div>
        <div class="scrollable">
          <History />
        </div>
      </div>
    </div>
  </div>
</template>
