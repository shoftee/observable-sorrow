<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import Item from "./Item.vue";

import { endpoint } from "@/composables/game-endpoint";

const show = ref(true);

const { resources } = endpoint().presenters;
const items = computed(() => {
  return resources.all.filter((r) => r.unlocked);
});

const { t } = useI18n();
</script>

<template>
  <div class="resources-container">
    <div class="card">
      <div v-if="items.length === 0" class="no-resources">{{ t("resources.section.empty") }}</div>
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
