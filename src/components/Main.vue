<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";

import Resources from "./Resource/List.vue";
import Environment from "./Environment.vue";
import History from "./History.vue";
import BonfireControls from "./Controls/Bonfire.vue";

import { injectChannel } from "@/composables/game-channel";
const { interactors, presenters } = injectChannel();

onMounted(async () => {
  // Start the game
  await interactors.controller.start();
})

const { t } = useI18n();

const sections = computed(() => presenters.section.items.filter(s => s.unlocked));
const enableSections = computed(() => sections.value.length > 1)
</script>

<template>
  <div class="nav-container scrollable">
    <ul class="nav nav-pills">
      <li class="nav-item" v-for="section in sections" :key="section.id">
        <button
          class="btn nav-link"
          :class="{
            active: section.active,
            disabled: !enableSections
          }"
        >
          {{ t(section.label) }}
          <span
            v-if="section.alert"
            class="badge rounded-pill bg-danger border border-light"
          >!</span>
        </button>
      </li>
    </ul>
    <div class="main-container tab-content scrollable">
      <div class="scrollable col p-2 pe-1">
        <Resources />
      </div>
      <div class="scrollable col-5 py-2 px-1">
        <div>
          <BonfireControls />
        </div>
      </div>
      <div class="env-container scrollable col p-2 ps-1 gap-2">
        <div>
          <Environment />
        </div>
        <div class="scrollable">
          <History />
        </div>
      </div>
    </div>
  </div>
</template>
