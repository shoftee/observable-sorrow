<template>
  <div class="card">
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
import Os from "@/app/os";
const resources = Os.states.resources();

import ResourceItem from "./ResourceItem.vue";
import { defineComponent } from "vue";
export default defineComponent({
  components: {
    "os-resource-item": ResourceItem,
  },
  data: () => ({
    show: true,
    resources: resources.all(),
  }),
});
</script>