<template>
  <div class="card align-self-stretch">
    <section>
      <div class="d-flex flex-column align-items-stretch">
        <div class="p-2 align-self-stretch">
          {{ season.id }}
        </div>
        <!-- <div class="p-2">
          Day <span>{{ state.dayOfSeason }}</span>
        </div>
        <div class="p-2 align-self-stretch">History</div> -->
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import Os from "@/app/os";

const environment = Os.states.environment();

import { defineComponent, unref } from "vue";
export default defineComponent({
  data() {
    return {
      state: environment.get(),
    };
  },
  computed: {
    season() {
      const state = unref(environment.get());
      return environment.meta().seasons[state.season];
    },
  },
});
</script>
