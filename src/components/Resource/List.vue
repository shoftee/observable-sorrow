<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import Item from "./Item.vue";

import { injectChannel } from "@/composables/game-channel";
import { getResources } from "@/composables/presenters";

const { t } = useI18n();

const show = ref(true);
const { presenters } = injectChannel();
const resources = getResources(presenters);
</script>

<template>
  <div class="card">
    <div v-if="resources.length === 0" class="text-start p-2">{{ t("resources.section.empty") }}</div>
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
