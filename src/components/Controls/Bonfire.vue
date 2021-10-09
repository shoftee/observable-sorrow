<script setup lang="ts">
import { computed } from "vue";

import BuildingButton from "./BuildingButton.vue";
import { injectChannel } from "@/composables/game-channel";

const { presenters } = injectChannel();
const items = computed(() => {
  return presenters.bonfire.all.filter((b) => b.unlocked);
});
</script>

<template>
  <div class="controls">
    <section class="row row-cols-1 row-cols-xl-2 g-2">
      <div class="col" v-for="item in items" :key="item.id">
        <BuildingButton :item="item" />
      </div>
    </section>
  </div>
</template>
