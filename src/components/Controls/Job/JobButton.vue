<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import EffectList from "../EffectList.vue";

import { JobId } from "@/app/interfaces";
import { JobItem } from "@/app/presenters";

import { useSend } from "@/composables/game-endpoint";
import { useKeyboardEvents } from "@/composables/keyboard-events";

const { item } = defineProps<{ item: JobItem; noIdle: boolean }>();

const send = useSend();
const { t } = useI18n();
const events = useKeyboardEvents()

const effects = computed(() => item.effects ?? []);

async function assignJob(id: JobId): Promise<void> {
  await send({ kind: "society", id: "assign-job", job: id });
}

async function unassignJob(id: JobId): Promise<void> {
  await send({ kind: "society", id: "unassign-job", job: id });
}
</script>
<template>
  <tippy>
    <!-- We need a container div because tippy listens to hover events to trigger and buttons don't fire events when disabled.-->
    <div class="col-12 btn-group">
      <button type="button" class="btn btn-secondary w-100 shadow-none" :disabled="item.capped || noIdle"
        @click="assignJob(item.id)">
        {{ t(item.label) }}
        <span class="number-annotation border">{{ item.pops }}</span>
      </button>
      <button type="button" class="btn btn-secondary" :disabled="item.capped || noIdle" @click="assignJob(item.id)">
        <span class="bi-plus"></span>
      </button>
      <button type="button" class="btn btn-secondary" :disabled="item.pops === 0" @click="unassignJob(item.id)">
        <span class="bi-dash"></span>
      </button>
    </div>
    <template #content>
      <div>
        <div class="card-header">
          <p class="description">{{ t(item.description) }}</p>
          <p class="flavor" v-if="item.flavor">{{ t(item.flavor) }}</p>
        </div>
        <EffectList v-if="effects.length > 0" :items="effects">
          <template #title>{{
          t(events.shift ? "effects.jobs.total" : "effects.jobs.per-worker")
          }}</template>
        </EffectList>
      </div>
    </template>
  </tippy>
</template>
