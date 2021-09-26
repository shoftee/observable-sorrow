<template>
  <div class="d-flex flex-column align-self-stretch">
    <div class="align-self-stretch">
      <i18n-t scope="global" :keypath="keypath" tag="span">
        <template #year>
          <span class="number">{{ n(calendar.year) }}</span>
        </template>
        <template #season>{{ t(calendar.season) }}</template>
        <template #weather>
          <span v-if="weather.title">{{ t(weather.title) }}</span>
        </template>
        <template #day>
          <span class="number">{{ calendar.day }}</span>
        </template>
      </i18n-t>
    </div>
  </div>
</template>

<script lang="ts">
import { Presenter } from "@/app/os";

const notation = Presenter.numbers;

import { computed, defineComponent, unref } from "vue";
import { useI18n } from "vue-i18n";

export default defineComponent({
  setup() {
    const { t } = { ...useI18n() };
    const calendar = unref(Presenter.environment.calendar);
    const weather = unref(Presenter.environment.weather);
    const keypath = computed(() => {
      return weather.title
        ? "environment.calendar.full.weather"
        : "environment.calendar.full.no-weather";
    });
    const n = (v: number) => notation.number(v, 3, "negative");
    return { t, n, calendar, weather, keypath };
  },
});
</script>
