<script setup lang="ts">
import BuildingButton from "./BuildingButton.vue";

import { getUnlockedBonfireItems } from "@/composables/presenters";
const items = getUnlockedBonfireItems();
</script>

<template>
  <div class="controls d-flex flex-column">
    <section class="row row-cols-1 row-cols-xl-2 g-2">
      <div class="col" v-for="item in items" :key="item.id">
        <BuildingButton :item="item" />
      </div>
    </section>
  </div>
</template>
