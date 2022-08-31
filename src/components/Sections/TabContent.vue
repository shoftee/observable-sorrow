<script setup lang="ts">
import { computed } from "vue";

import BonfireSection from "./BonfireSection.vue";
import SocietySection from "./SocietySection.vue";
import ScienceSection from "./ScienceSection.vue";

import { SectionId } from "@/app/interfaces";

const props = defineProps<{ active: SectionId }>();

const content = computed(() => {
  const sectionId = props.active;
  switch (sectionId) {
    case "bonfire":
      return BonfireSection;
    case "society":
      return SocietySection;
    case "science":
      return ScienceSection;
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
