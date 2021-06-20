<template>
  <div class="d-flex flex-column card align-self-stretch">
    <section>
      <div class="d-flex flex-column align-items-stretch">
        <div class="p-2 align-self-stretch">
          {{ t(season.title) }} - {{ state.dayOfSeason }}
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import Os from "@/app/os";

const states = Os.environment;
const text = Os.text.environment();

import { computed, defineComponent, unref } from "vue";
import { useI18n } from "vue-i18n";
export default defineComponent({
  setup() {
    const state = states.calendar();
    const season = computed(() => text.season(unref(state).season));
    const { t } = { ...useI18n() };

    return { t, state, season };
  },
});
</script>
