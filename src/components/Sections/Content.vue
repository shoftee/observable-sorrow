<script setup lang="ts">
import { computed } from "vue";

import Bonfire from "./Bonfire.vue";
import Society from "./Society.vue";
import Science from "./Science.vue";

import { SectionId } from "@/app/interfaces";

const props = defineProps<{ active: SectionId }>();

const content = computed(() => {
  const sectionId = props.active;
  switch (sectionId) {
    case "bonfire":
      return Bonfire;
    case "society":
      return Society;
    case "science":
      return Science;
    default:
      throw new Error(`unexpected section name ${sectionId}`);
  }
});
</script>

<template>
  <div>
    <component :is="content" />
  </div>
</template>
