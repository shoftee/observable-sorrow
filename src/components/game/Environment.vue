<template>
  <div class="d-flex flex-column card align-self-stretch">
    <section>
      <div class="d-flex flex-column align-items-stretch">
        <div class="p-2 align-self-stretch">
          {{ t(calendar.season) }}
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { Presenter } from "@/app/os";

import { defineComponent, unref } from "vue";
import { useI18n } from "vue-i18n";

export default defineComponent({
  setup() {
    const { t } = { ...useI18n() };
    const calendar = unref(Presenter.environment.calendar);
    return { t, calendar };
  },
});
</script>
