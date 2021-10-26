<script setup lang="ts">
import { computed, ref } from 'vue';
import { injectChannel } from '@/composables/game-channel';

const { interactors } = injectChannel();
const paused = ref(false);
const label = computed(() => paused.value ? "game.control.unpawse" : "game.control.pawse");
async function pause() {
  await interactors.controller.stop()
  paused.value = true
}
async function unpause() {
  await interactors.controller.start()
  paused.value = false;
}
</script>
<template>
  <button type="button" :class="{ active: paused }" @click="paused ? unpause() : pause()">
    <i18n-t :keypath="label" scope="global"></i18n-t>
  </button>
</template>