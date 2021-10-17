<script setup lang="ts">
import { computed, inject } from "vue";
import { useI18n } from "vue-i18n";

import Effects from "./Effects.vue";

import { JobId } from "@/_interfaces";
import { JobItem } from "@/app/presenters";
import { injectChannel } from "@/composables/game-channel";
import { KeyboardEventsKey } from "@/composables/keyboard-events";

const { item } = defineProps<{ item: JobItem, noUnemployment: boolean }>();
const { t } = useI18n();
const events = inject(KeyboardEventsKey);

const effects = computed(() => item.effects ?? []);

const interactors = injectChannel().interactors;

async function assignJob(id: JobId): Promise<void> {
  await interactors.society.assignJob(id);
}
async function unassignJob(id: JobId): Promise<void> {
  await interactors.society.unassignJob(id);
}
</script>

<template>
  <tippy>
    <!-- We need a container div because tippy listens to hover events to trigger and buttons don't fire events when disabled.-->
    <div class="col-12 btn-group">
      <button
        type="button"
        class="btn btn-primary w-100 shadow-none"
        :disabled="item.capped || noUnemployment"
        @click="assignJob(item.id)"
      >
        {{ t(item.label) }}
        <span class="number-annotation border">{{ item.pops }}</span>
      </button>
      <button
        type="button"
        class="btn btn-primary"
        :disabled="item.capped || noUnemployment"
        @click="assignJob(item.id)"
      >
        <span class="bi-plus"></span>
      </button>
      <button
        type="button"
        class="btn btn-primary"
        :disabled="item.pops === 0"
        @click="unassignJob(item.id)"
      >
        <span class="bi-dash"></span>
      </button>
    </div>
    <template #content>
      <div>
        <div class="card-header">
          <p class="description">{{ t(item.description) }}</p>
          <p class="flavor" v-if="item.flavor">{{ t(item.flavor) }}</p>
        </div>
        <Effects v-if="effects.length > 0" :items="effects">
          <template
            #title
          >{{ t(events?.shift ? "jobs.effects.title.total" : "jobs.effects.title.per-worker") }}</template>
        </Effects>
      </div>
    </template>
  </tippy>
</template>
