<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import Item from "./Item.vue";

import { useEndpoint } from "@/composables/game-endpoint";

const { t } = useI18n();

const show = ref(true);
const { resources } = useEndpoint((ep) => {
  return {
    resources: ep.presenters.resources,
  };
});

const items = computed(() => resources.all.filter((r) => r.unlocked));
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
            <Item :item="item" class="w-100" />
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
