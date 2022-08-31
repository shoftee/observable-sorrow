<script setup lang="ts">
import JobsSection from "./JobsSection.vue";
import ManagementSection from "./ManagementSection.vue";

import { useEndpoint } from "@/composables/game-endpoint";

const { management } = useEndpoint((ep) => {
  return { management: ep.presenters.section.management };
});
</script>

<template>
  <div class="section-stack">
    <JobsSection />
    <ManagementSection v-if="management.unlocked" />
  </div>
</template>
