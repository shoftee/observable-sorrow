<script setup lang="ts">
import { ref } from 'vue';

import { useI18n } from 'vue-i18n';
import { injectChannel } from '@/composables/game-channel';

const { t } = useI18n();
const { controller } = injectChannel().interactors;

const paused = ref(false);
async function pause() {
  await controller.stop()
  paused.value = true
}
async function unpause() {
  await controller.start()
  paused.value = false;
}
</script>
<template>
  <button
    type="button"
    :class="{ active: paused }"
    @click="paused ? unpause() : pause()"
  >{{ t(paused ? "game.control.unpawse" : "game.control.pawse") }}</button>
</template>