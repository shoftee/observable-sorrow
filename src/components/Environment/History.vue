<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Pawse from './Pawse.vue';

import { injectChannel } from '@/composables/game-channel';
import { LogItem } from '@/app/presenters';
import { useLogItemEvent } from '@/composables/use-event-listener';
import { Kind } from '@/app/state';

const { environment, formatter: fmt } = injectChannel().presenters;
const { t } = useI18n();

let epochId = ref(0);
const epochs: LogEpoch[] = reactive([]);
const requireNewEpoch = ref(true);

interface LogEpoch {
  id: number;
  year: number;
  seasonLabel: string;
  ref: Element | undefined;
  events: {
    id: number,
    text: string,
    ref: Element | undefined;
  }[];
}

watch(() => environment.calendar.season, () => {
  requireNewEpoch.value = true;
})

function clearLog() {
  epochs.length = 0;
  requireNewEpoch.value = true;
}

function ensureRecent() {
  if (requireNewEpoch.value) {
    // Use non-reactive copies, otherwise old epochs will change with current calendar.
    const { year, seasonLabel } = environment.calendar;
    epochs.unshift({
      id: epochId.value++,
      year: year,
      seasonLabel: seasonLabel,
      ref: undefined,
      events: [],
    });
    requireNewEpoch.value = false;
  }
}

const latestEpoch = computed(() => {
  ensureRecent();
  return epochs[0];
});
useLogItemEvent((e: CustomEvent<LogItem>): void => {
  const container = document.getElementsByClassName("log-container")[0];
  if (!container) {
    throw new Error(".log-container not found");
  }

  for (let i = 0; i < epochs.length; i++) {
    const epoch = epochs[i];
    if (epoch.ref === undefined) continue;
    const epochRef = epoch.ref as HTMLElement;

    if (i > 0 && epochRef.offsetTop > container.clientHeight) {
      // everything after this point must go.
      epochs.splice(i);
      continue;
    }

    for (let j = 0; j < epoch.events.length; j++) {
      const event = epoch.events[j];
      if (event.ref === undefined) continue;

      const eventRef = event.ref as HTMLElement;
      if (eventRef.offsetTop > container.clientHeight) {
        // everything after this point must go.
        epoch.events.splice(j);
      }
    }
  }

  const text = e.detail.event.kind === Kind.Label ? t(e.detail.event.label) : e.detail.event.text;

  latestEpoch.value.events.unshift({
    id: e.detail.id,
    text: text,
    ref: undefined,
  });
});
</script>

<template>
  <section unscrollable class="history-container">
    <div class="game-controls-container">
      <div>You are a kitten in a catnip forest.</div>
      <div class="btn-group">
        <button type="button" class="btn btn-outline-secondary" @click="clearLog">Clear log</button>
        <Pawse class="btn btn-outline-secondary" />
      </div>
    </div>
    <div class="log-container small p-2">
      <div
        class="log-section mb-3"
        v-for="epoch in epochs"
        :key="epoch.id"
        :ref="el => { if (el) epoch.ref = el as Element }"
      >
        <div class="border-bottom">
          <i18n-t scope="global" :keypath="environment.calendar.epochLabel">
            <template #year>
              <span class="number">{{ fmt.number(epoch.year) }}</span>
            </template>
            <template #season>{{ t(epoch.seasonLabel) }}</template>
          </i18n-t>
        </div>
        <div
          class="log-event"
          v-for="event in epoch.events"
          :key="event.id"
          :ref="el => { if (el) event.ref = el as Element }"
        >{{ event.text }}</div>
      </div>
    </div>
  </section>
</template>
