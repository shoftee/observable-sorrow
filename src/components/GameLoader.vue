<script setup lang="ts">
import { onMounted } from 'vue';

import { Channel, Setup } from '@/app/channel';

const emit = defineEmits<{
  (e: "loaded", channel: Channel): void,
}>();

onMounted(async () => {
  const channel = await Setup();
  emit("loaded", channel);
});
</script>

<template>
  <div class="loader">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
</template>