<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { endpoint } from "@/composables/game-endpoint";

const { t } = useI18n();

const { environment, formatter: fmt } = endpoint().presenters;
const state = environment.calendar;
</script>

<template>
  <div class="calendar-container">
    <i18n-t scope="global" :keypath="state.calendarLabel" tag="span">
      <template #year>
        <span class="number">{{ fmt.number(state.year) }}</span>
      </template>
      <template #season>{{ t(state.seasonLabel) }}</template>
      <template #weather>
        <span v-if="state.weatherLabel">{{ t(state.weatherLabel) }}</span>
      </template>
      <template #day>
        <span class="number">{{ state.day }}</span>
      </template>
    </i18n-t>
  </div>
</template>