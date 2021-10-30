<script setup lang="ts">
import { onMounted } from "vue";

import { Endpoint, Setup } from "@/app/endpoint";

const emit = defineEmits<{
  (e: "loaded", endpoint: Endpoint): void,
}>();

onMounted(async () => {
  const endpoint = await Setup();
  emit("loaded", endpoint);
});
</script>

<template>
  <div class="loader">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
</template>