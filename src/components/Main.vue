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
  <div class="d-flex flex-column scrollable align-items-center">
    <ul class="nav nav-tabs justify-content-center">
      <li class="nav-item">
        <button class="nav-link active">Bonfire</button>
      </li>
    </ul>
    <div class="main-container w-100 d-flex flex-row scrollable">
      <div class="scrollable col p-2 pe-1">
        <div>
          <Resources />
        </div>
      </div>
      <div class="scrollable col-5 py-2 px-1">
        <div>
          <BonfireControls />
        </div>
      </div>
      <div class="scrollable col p-2 ps-1 d-flex flex-column gap-2">
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
