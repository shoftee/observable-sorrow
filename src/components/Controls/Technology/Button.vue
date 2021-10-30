<script setup lang="ts">
import { useI18n } from "vue-i18n";

import Detail from "./Detail.vue";

import { TechId } from "@/app/interfaces";
import { TechItem } from "@/app/presenters";

import { injectChannel } from "@/composables/game-channel";
const interactors = injectChannel().interactors;

const { t } = useI18n();

const { tech } = defineProps<{ tech: TechItem }>();

async function research(id: TechId): Promise<void> {
  await interactors.science.researchTech(id);
}
</script>

<template>
  <tippy>
    <!-- We need a container div because tippy listens to hover events to trigger and buttons don't fire events when disabled.-->
    <div>
      <button
        type="button"
        class="btn btn-outline-secondary w-100"
        :class="{ capped: tech.fulfillment.capped }"
        :disabled="!tech.fulfillment.fulfilled || tech.researched"
        @click="research(tech.id)"
      >
        <span v-if="tech.researched" class="bi bi-check"></span>
        {{ t(tech.label) }}
      </button>
    </div>
    <template #content>
      <Detail :item="tech" />
    </template>
  </tippy>
</template>
