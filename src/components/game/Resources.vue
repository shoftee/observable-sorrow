<template>
  <div class="card">
    <div v-if="resources.length == 0" class="text-start p-2">
      {{ t("resources.section.empty") }}
    </div>
    <div v-else class="d-flex flex-column align-items-stretch">
      <button class="btn shadow-none" @click="show = !show">
        <div class="clearfix">
          <span class="float-start"> {{ t("resources.section.title") }} </span>
          <span class="float-end">
            <i v-if="!show" class="bi bi-arrows-expand"></i
          ></span>
        </div>
      </button>
      <ul v-show="show" class="list-group list-group-flush">
        <os-resource-item
          v-for="resource in resources"
          :key="resource.id"
          :item="resource"
          class="p-1 small list-group-item"
        />
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import Os from "@/app/os";
const resources = Os.states.resources();

import { computed, defineComponent } from "vue";
import { useI18n } from "vue-i18n";

import ResourceItem from "./ResourceItem.vue";
export default defineComponent({
  components: {
    "os-resource-item": ResourceItem,
  },
  setup() {
    const list = computed(() => resources.all());
    const { t } = { ...useI18n() };
    return { t, show: true, resources: list };
  },
});
</script>