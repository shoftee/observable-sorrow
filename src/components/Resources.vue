<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import { getUnlockedResources } from "@/composables/presenters";

const { t } = { ...useI18n() };
const show = ref(true);
const resources = getUnlockedResources()
const isEmpty = computed(() => resources.value.length == 0);

import ResourceItem from "./ResourceItem.vue";
</script>

<template>
  <div class="card">
    <div v-if="isEmpty" class="text-start p-2">{{ t("resources.section.empty") }}</div>
    <div v-else class="d-flex flex-column">
      <button class="btn shadow-none" @click="show = !show">
        <div class="clearfix">
          <span class="float-start">{{ t("resources.section.label") }}</span>
          <span class="float-end">
            <i v-if="!show" class="bi bi-arrows-expand"></i>
          </span>
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
