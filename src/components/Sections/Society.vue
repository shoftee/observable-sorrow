<script setup lang="ts">
import Jobs from "./Jobs.vue";
import Management from "./Management.vue";

import { useEndpoint } from "@/composables/game-endpoint";

const { management } = useEndpoint((ep) => {
  return { management: ep.presenters.section.management };
});
</script>

<template>
  <div class="section-stack">
    <Jobs />
    <Management v-if="management.unlocked" />
  </div>
</template>
