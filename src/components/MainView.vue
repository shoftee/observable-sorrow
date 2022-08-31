<script setup lang="ts">
import { ref } from "vue";

// import HappinessView from "./Controls/HappinessView.vue";
import TabNavigation from "./Sections/TabNavigation.vue";
import TabContent from "./Sections/TabContent.vue";
import DevToolsView from "./DevToolsView.vue";
import CalendarView from "./Environment/CalendarView.vue";
import HistoryView from "./Environment/HistoryView.vue";
import ResourceList from "./Resources/ResourceList.vue";

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
    <TabNavigation :active="activeSection" @changed="activeSection = $event" />
    <div unscrollable class="main-container gap-2">
      <div unscrollable class="col">
        <ResourceList />
      </div>
      <div unscrollable class="col-5">
        <TabContent :active="activeSection" />
      </div>
      <div unscrollable class="env-container col">
        <CalendarView />
        <HistoryView />
      </div>
    </div>
    <teleport to=".header-middle">
      <!-- <HappinessView /> -->
    </teleport>
    <teleport to=".header-end">
      <button class="btn btn-link p-0 m-0" @click="save">Save</button>
    </teleport>
    <teleport to=".app-container">
      <DevToolsView v-if="devtools?.on" />
    </teleport>
  </div>
</template>
