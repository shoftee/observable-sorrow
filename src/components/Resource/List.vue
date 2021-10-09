<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import Item from "./Item.vue";

import { getResources } from "@/composables/presenters";
import { usePresenters } from "@/composables/game-channel";

const { t } = { ...useI18n() };

const show = ref(true);
const presenters = await usePresenters();
const resources = getResources(presenters)
const isEmpty = computed(() => resources.value.length == 0);
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
          <Item :item="resource" class="w-100" />
        </li>
      </ul>
    </div>
  </div>
</template>
