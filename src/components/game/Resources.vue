<script lang="ts">
import { defineComponent, computed, ref, reactive } from "vue";
import { useI18n } from "vue-i18n";

import { Presenter } from "@/app/os";

import ResourceItem from "./ResourceItem.vue";
export default defineComponent({
  components: {
    ResourceItem,
  },
  setup() {
    const { t } = { ...useI18n() };

    const show = ref(true);
    const all = reactive(Presenter.resources.all.value);
    const resources = computed(() => all.filter((m) => m.unlocked ?? true));
    const isEmpty = computed(() => resources.value.length == 0);

    return {
      t,
      show,
      isEmpty,
      resources,
    };
  },
});
</script>

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
          <ResourceItem :item="resource" class="w-100" />
        </li>
      </ul>
    </div>
  </div>
</template>
