<template>
  <div class="card">
    <div v-if="isEmpty" class="text-start p-2">
      {{ t("resources.section.empty") }}
    </div>
    <div v-else class="d-flex flex-column">
      <button class="btn shadow-none" @click="show = !show">
        <div class="clearfix">
          <span class="float-start">{{ t("resources.section.label") }}</span>
          <span class="float-end">
            <i v-if="!show" class="bi bi-arrows-expand"></i
          ></span>
        </div>
      </button>
      <ul v-if="show" class="resources-list">
        <li v-for="resource in resources" :key="resource.id">
          <os-resource-item :item="resource" class="w-100" />
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { Presenter } from "@/app/os";

import { defineComponent, computed, ref, unref } from "vue";
import { useI18n } from "vue-i18n";

import ResourceItem from "./ResourceItem.vue";
export default defineComponent({
  components: {
    "os-resource-item": ResourceItem,
  },
  setup() {
    const { t } = { ...useI18n() };
    const show = ref(true);
    const items = unref(Presenter.resources.items);

    const resources = computed(() => items.filter((e) => e.unlocked));
    const isEmpty = computed(() => unref(resources).length == 0);

    return {
      t,
      show,
      isEmpty,
      resources,
    };
  },
});
</script>