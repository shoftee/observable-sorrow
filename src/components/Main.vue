<script setup lang="ts">
import { ref } from "vue";

import Calendar from "./Environment/Calendar.vue";
import History from "./Environment/History.vue";
import Resources from "./Resources/List.vue";

import DevTools from "./DevTools.vue";
// import Happiness from "./Controls/Happiness.vue";

import SectionTabs from "./Sections/Tabs.vue";
import SectionContent from "./Sections/Content.vue";

import { SectionId } from "@/app/interfaces";

import { useEndpoint } from "@/composables/game-endpoint";

const { send } = useEndpoint((ep) => {
  return ep;
});

const activeSection = ref<SectionId>("bonfire");

async function save(): Promise<void> {
  await send({ kind: "meta", id: "save-game" });
}

const devtools = window.__OS_DEVTOOLS__;
</script>

<template>
  <div class="nav-container">
    <SectionTabs :active="activeSection" @changed="activeSection = $event" />
    <div unscrollable class="main-container gap-2">
      <div unscrollable class="col">
        <Resources />
      </div>
      <div unscrollable class="col-5">
        <SectionContent :active="activeSection" />
      </div>
      <div unscrollable class="env-container col">
        <Calendar />
        <History />
      </div>
    </div>
    <teleport to=".header-middle">
      <!-- <Happiness /> -->
    </teleport>
    <teleport to=".header-end">
      <button class="btn btn-link p-0 m-0" @click="save">Save</button>
    </teleport>
    <teleport to=".app-container">
      <DevTools v-if="devtools?.on" />
    </teleport>
  </div>
</template>
