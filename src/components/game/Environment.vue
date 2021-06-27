<template>
  <div class="d-flex flex-column align-self-stretch">
    <div class="align-self-stretch">
      Year {{ n(calendar.year) }} &ndash; {{ t(calendar.season) }}, day
      {{ calendar.day }}
    </div>
  </div>
</template>

<script lang="ts">
import { Presenter } from "@/app/os";

const notation = Presenter.numbers;

import { defineComponent, unref } from "vue";
import { useI18n } from "vue-i18n";

export default defineComponent({
  setup() {
    const { t } = { ...useI18n() };
    const calendar = unref(Presenter.environment.calendar);
    const n = (v: number) => notation.display(v, 3, false);
    return { t, n, calendar };
  },
});
</script>
