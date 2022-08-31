<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import ObserveSkyButton from "./ObserveSkyButton.vue";
import PawseButton from "./PawseButton.vue";

import { LogItem } from "@/app/presenters";
import { newCalendarView } from "@/app/presenters/views";
import { useFormatter, useStateManager } from "@/composables/game-endpoint";
import { useLogItemEvent } from "@/composables/use-event-listener";

import { LogEpoch, newLogEpoch, removeClippedEvents } from "./_types";

const manager = useStateManager();
const calendar = newCalendarView(manager.state);
const fmt = useFormatter()

const { t } = useI18n();

let epochId = ref(0);
const epochs: LogEpoch[] = reactive([]);
const requireNewEpoch = ref(true);

watch(
  () => calendar.season,
  () => { requireNewEpoch.value = true; },
);

function clearLog() {
  epochs.length = 0;
  requireNewEpoch.value = true;
}

function latestEpoch(): LogEpoch {
  if (requireNewEpoch.value) {
    const newEpoch = newLogEpoch(epochId.value++, calendar.year, calendar.season);
    epochs.unshift(newEpoch);
    requireNewEpoch.value = false;
  }

  return epochs[0];
}

useLogItemEvent((e: CustomEvent<LogItem>): void => {
  const container = document.getElementsByClassName("log-container")[0];
  if (!container) {
    throw new Error(".log-container not found");
  }

  removeClippedEvents(epochs, container);

  latestEpoch().events.unshift({
    id: e.detail.id,
    text: e.detail.resolve(t, fmt),
  });
});
</script>

<template>
  <section unscrollable class="history-container">
    <div class="game-controls-container">
      <div>{{  t("game.blurb")  }}</div>
      <div class="btn-group">
        <ObserveSkyButton class="btn btn-outline-secondary" />
        <button type="button" class="btn btn-outline-secondary" @click="clearLog">
          {{  t("game.control.clear-log")  }}
        </button>
        <PawseButton class="btn btn-outline-secondary" />
      </div>
    </div>
    <div class="log-container small p-2">
      <div class="log-section mb-3" v-for="epoch in epochs" :key="epoch.id"
        :ref="el => { if (el) epoch.ref = el as Element }">
        <div class="border-bottom">
          <i18n-t scope="global" :keypath="calendar.epochLabel">
            <template #year>
              <span class="number">{{  fmt.number(epoch.year)  }}</span>
            </template>
            <template #season>{{  t(epoch.seasonLabel)  }}</template>
          </i18n-t>
        </div>
        <div class="log-event" v-for="event in epoch.events" :key="event.id"
          :ref="el => { if (el) event.ref = el as Element }">
          {{  event.text  }}
        </div>
      </div>
    </div>
  </section>
</template>
