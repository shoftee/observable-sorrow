<template>
  <div class="card align-self-stretch">
    <section>
      <div class="d-flex flex-column align-items-stretch">
        <div class="p-2 align-self-stretch">
          {{ t(season) }}
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import Os from "@/app/os";

const environment = Os.states.environment();
const text = Os.text.environment();

import { computed, defineComponent, unref } from "vue";
import { useI18n } from "vue-i18n";
export default defineComponent({
  setup() {
    const state = environment.get();
    const season = computed(() => text.season(unref(state).season));
    return {
      ...useI18n(),
      state,
      season,
    };
  },
});
</script>
