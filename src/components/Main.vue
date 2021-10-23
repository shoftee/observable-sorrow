<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

import Resources from "./Resource/List.vue";
import Environment from "./Environment.vue";
import History from "./History.vue";
import DevTools from "./DevTools.vue";
import Sections from "./Controls/Sections.vue";
import BonfireControls from "./Controls/Bonfire.vue";
import SocietyControls from "./Controls/Society.vue";
import ScienceControls from "./Controls/Science.vue";

import { SectionId } from "@/app/interfaces";
import { SectionItem } from "@/app/presenters";

import { injectChannel } from "@/composables/game-channel";
const { interactors, presenters } = injectChannel();

onMounted(async () => {
  // Start the game
  await interactors.controller.start();
})

const { t } = useI18n();

const sections = computed(() => presenters.section.items.filter(s => s.unlocked));

const activeSection = ref<SectionId>("bonfire");

function sectionChanged(item: SectionItem) {
  activeSection.value = item.id;
}

async function save(): Promise<void> {
  await interactors.store.save();
}

const sectionContent = computed(() => {
  const sectionId = activeSection.value;
  switch (sectionId) {
    case "bonfire": return BonfireControls;
    case "society": return SocietyControls;
    case "science": return ScienceControls;
    default: throw new Error(`unexpected section name ${sectionId}`);
  }
});

const dt = window.__OS_DEVTOOLS__;
</script>

<template>
  <div class="nav-container scrollable">
    <Sections :sections="sections" :active="activeSection" @changed="sectionChanged">
      <template #default="{ section }">
        {{ t(section.label) }}
        <span
          v-if="section.alert"
          class="number-annotation bg-danger"
        >{{ section.alert }}</span>
      </template>
    </Sections>
    <div class="main-container tab-content scrollable">
      <div class="scrollable col p-2 pe-1">
        <Resources />
      </div>
      <div class="scrollable col-5 py-2 px-1">
        <div>
          <component :is="sectionContent" />
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
    <teleport to=".header-end">
      <button class="btn btn-link p-0 m-0" @click="save">Save</button>
    </teleport>
    <suspense>
      <DevTools v-if="dt && dt.on" />
    </suspense>
  </div>
</template>
