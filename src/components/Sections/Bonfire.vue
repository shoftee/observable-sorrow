<script setup lang="ts">
import BuildingButton from "@/components/Controls/Building/Button.vue";

import { useStateManager } from "@/composables/game-endpoint";
import { filterArrayView, fromIds, newBonfireItemView } from "@/app/presenters/views";

const manager = useStateManager();

const all = fromIds(manager, ["gather-catnip"], newBonfireItemView)
const items = filterArrayView(all, b => b.unlocked);
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
