<template>
  <div class="d-flex flex-column align-self-stretch">
    <div class="align-self-stretch">
      <i18n-t scope="global" :keypath="keypath" tag="span">
        <template #year>
          <span class="number">{{ n(calendar.year) }}</span>
        </template>
        <template #season>{{ t(calendar.season) }}</template>
        <template v-if="weather.any" #weather>{{ t(weather.title) }}</template>
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

import { computed, defineComponent, reactive, unref } from "vue";
import { useI18n } from "vue-i18n";

export default defineComponent({
  setup() {
    const { t } = { ...useI18n() };
    const calendar = unref(Presenter.environment.calendar);
    const weather = reactive({ any: false, title: undefined });
    const keypath = computed(() =>
      weather.any
        ? "environment.calendar.full.weather"
        : "environment.calendar.full.no-weather",
    );
    const n = (v: number) => notation.display(v, 3, false);
    return { t, n, calendar, weather, keypath };
  },
});
</script>
