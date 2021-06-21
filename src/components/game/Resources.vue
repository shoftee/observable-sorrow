<template>
  <div class="card">
    <div v-if="isEmpty" class="text-start p-2">
      <span>{{ t("resources.section.empty") }}</span>
    </div>
    <div v-else class="d-flex flex-column align-items-stretch">
      <button class="btn shadow-none" @click="show = !show">
        <div class="clearfix">
          <span class="float-start">{{ t("resources.section.label") }}</span>
          <span class="float-end">
            <i v-if="!show" class="bi bi-arrows-expand"></i
          ></span>
        </div>
      </button>
      <ul v-if="show" class="list-group list-group-flush">
        <os-resource-item
          v-for="resource in resources.values()"
          :key="resource.id"
          :item="resource"
          class="p-1 small list-group-item"
        />
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
    const resources = unref(Presenter.resources.unlocked);
    const isEmpty = computed(() => resources.size == 0);
    return {
      t,
      show,
      isEmpty,
      resources,
      messages: {
        empty: t("resources.section.empty"),
        title: t("resources.section.label"),
      },
    };
  },
});
</script>