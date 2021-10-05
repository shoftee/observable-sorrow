<script lang="ts">
import { defineComponent, readonly } from "vue";
import { useI18n } from "vue-i18n";

import { Presenters } from "@/app/os";

export default defineComponent({
  setup() {
    const { t } = { ...useI18n() };

    const fmt = Presenters.formatter;
    const state = readonly(Presenters.environment.calendar.value);

    return { t, fmt, state };
  },
});
</script>

<template>
  <div class="d-flex flex-column align-self-stretch">
    <div class="align-self-stretch">
      <i18n-t scope="global" :keypath="state.calendarLabel" tag="span">
        <template #year>
          <span class="number">{{ fmt.number(state.year) }}</span>
        </template>
        <template #season>{{ t(state.seasonLabel) }}</template>
        <template #weather>
          <span v-if="state.weatherLabel">
            {{ t(state.weatherLabel) }}
          </span>
        </template>
        <template #day>
          <span class="number">{{ state.day }}</span>
        </template>
      </i18n-t>
    </div>
  </div>
</template>