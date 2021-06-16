<template>
  <div class="card resources-list">
    <button class="btn shadow-none text-start" @click="show = !show">
      <span>
        Resources
        <i v-if="!show" class="bi bi-arrows-expand"></i>
      </span>
    </button>
    <ul
      v-show="show"
      v-for="resource in resources"
      :key="resource.id"
      class="list-group list-group-flush"
    >
      <os-resource-item :item="resource" class="p-1 small" />
    </ul>
  </div>
</template>

<script lang="ts">
import GameInstance from "@/app/game";

import { defineComponent } from "vue";
import ResourceItem from "./ResourceItem.vue";
export default defineComponent({
  components: {
    "os-resource-item": ResourceItem,
  },
  data: () => ({
    show: true,
    resources: GameInstance.resources.allStates(),
  }),
});
</script>