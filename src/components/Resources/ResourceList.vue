<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import ResourceItem from "./ResourceItem.vue";

import { useStateManager } from "@/composables/game-endpoint";
import { filterArrayView, allResourceViews } from "@/app/presenters/views";

const { t } = useI18n();

const show = ref(true);
const manager = useStateManager();

const all = allResourceViews(manager.state);
const items = filterArrayView(all, r => r.unlocked);
</script>

<template>
  <div class="resources-container">
    <div class="card">
      <div v-if="items.length === 0" class="no-resources">
        {{ t("resources.section.empty") }}
      </div>
      <div v-else class="base-resources">
        <button class="btn shadow-none" @click="show = !show">
          <div class="clearfix">
            <span class="float-start">{{ t("resources.section.label") }}</span>
            <span class="float-end">
              <i v-if="!show" class="bi bi-arrows-expand"></i>
            </span>
          </div>
        </button>
        <ul v-if="show">
          <li v-for="item in items" :key="item.id">
            <ResourceItem :item="item" class="w-100" />
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
