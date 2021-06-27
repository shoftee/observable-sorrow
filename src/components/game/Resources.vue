<template>
  <div class="card">
    <div v-if="isEmpty" class="text-start p-2">
      {{ messages.empty }}
    </div>
    <div v-else class="d-flex flex-column align-items-stretch">
      <button class="btn shadow-none" @click="show = !show">
        <div class="clearfix">
          <span class="float-start">{{ messages.title }}</span>
          <span class="float-end">
            <i v-if="!show" class="bi bi-arrows-expand"></i
          ></span>
        </div>
      </button>
      <ul v-if="show" class="resources-list">
        <os-resource-item
          v-for="resource in unlocked"
          :key="resource.id"
          :item="resource"
          class="resource-item"
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
    const resources = unref(Presenter.resources.items);

    const unlocked = computed(() => {
      return resources.filter((e) => e.unlocked);
    });

    const isEmpty = computed(() => unref(unlocked).length == 0);
    return {
      t,
      show,
      isEmpty,
      unlocked,
      messages: {
        empty: t("resources.section.empty"),
        title: t("resources.section.label"),
      },
    };
  },
});
</script>