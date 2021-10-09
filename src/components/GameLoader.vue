<script setup lang="ts">
import { onMounted } from 'vue';

import { Channel, Setup } from '@/app/os';

const emit = defineEmits<{
  (e: "loaded", channel: Channel): void,
}>();

onMounted(async () => {
  const channel = await Setup();
  emit("loaded", channel);
});
</script>

<template>
  <div class="w-100 h-100 d-flex align-items-center justify-content-center">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
</template>