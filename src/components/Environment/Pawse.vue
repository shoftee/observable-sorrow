<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import { useEndpoint } from "@/composables/game-endpoint";

const { controller } = useEndpoint((ep) => {
  return { controller: ep.interactors.controller };
});

const { t } = useI18n();

const paused = ref(false);
async function pause() {
  await controller.stop();
  paused.value = true;
}
async function unpause() {
  await controller.start();
  paused.value = false;
}
</script>
<template>
  <button
    type="button"
    :class="{ active: paused }"
    @click="paused ? unpause() : pause()"
  >
    {{ t(paused ? "game.control.unpawse" : "game.control.pawse") }}
  </button>
</template>
