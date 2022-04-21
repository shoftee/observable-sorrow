<script setup lang="ts">
import { computed } from "vue";

import BuildingButton from "@/components/Controls/Building/Button.vue";

import { useEndpoint } from "@/composables/game-endpoint";
const { bonfire } = useEndpoint((ep) => {
  return {
    bonfire: ep.presenters.bonfire,
  };
});

const items = computed(() => bonfire.all.filter((b) => b.unlocked));
</script>

<template>
  <div class="controls container">
    <div class="row row-cols-1 row-cols-xl-2 g-2">
      <div class="col" v-for="item in items" :key="item.id">
        <BuildingButton :item="item" />
      </div>
    </div>
  </div>
</template>
