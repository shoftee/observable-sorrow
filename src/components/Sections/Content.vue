<script setup lang="ts">
import { computed } from 'vue';

import Bonfire from "../Controls/Bonfire.vue";
import Society from "../Controls/Society.vue";
import Science from "../Controls/Science.vue";

import { SectionId } from '@/app/interfaces';

const props = defineProps<{ active: SectionId }>();

const content = computed(() => {
  const sectionId = props.active;
  switch (sectionId) {
    case "bonfire": return Bonfire;
    case "society": return Society;
    case "science": return Science;
    default: throw new Error(`unexpected section name ${sectionId}`);
  }
});

</script>

<template>
  <div>
    <component :is="content" />
  </div>
</template>