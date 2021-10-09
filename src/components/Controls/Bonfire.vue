<script setup lang="ts">
import BuildingButton from "./BuildingButton.vue";

import { getBonfireItems } from "@/composables/presenters";
import { injectChannel } from "@/composables/game-channel";

const { presenters } = injectChannel();
const items = getBonfireItems(presenters);
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
