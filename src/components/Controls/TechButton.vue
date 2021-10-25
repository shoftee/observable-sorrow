<script setup lang="ts">
import { useI18n } from "vue-i18n";

import Ingredients from "@/components/Controls/Ingredients.vue"

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
    <div class="col-12">
      <button
        type="button"
        class="btn btn-outline-secondary w-100"
        :class="{ capped: tech.capped }"
        :disabled="!tech.fulfilled || tech.researched"
        @click="research(tech.id)"
      >
        <span v-if="tech.researched" class="bi bi-check"></span>
        {{ t(tech.label) }}
      </button>
    </div>
    <template #content>
      <div>
        <div class="card-header">
          <p class="description">{{ t(tech.description) }}</p>
          <p class="flavor" v-if="tech.flavor">{{ t(tech.flavor) }}</p>
        </div>
        <Ingredients class="border-bottom" v-if="!tech.researched" :items="tech.ingredients" />
        <ul class="effects-list">
          <li v-for="effect in tech.effects" :key="effect.id">
            <span>{{ t(effect.label) }}</span>
          </li>
        </ul>
      </div>
    </template>
  </tippy>
</template>
