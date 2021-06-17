<template>
  <div class="container">
    <section class="row g-2">
      <div class="col-6">
        <button
          type="button"
          class="btn btn-primary w-100"
          :class="{ disabled: catnip.amount == catnip.capacity }"
          @click="gatherCatnip()"
        >
          Gather catnip
        </button>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import Os from "@/app/os";

const controls = Os.interactors.controls;

import { defineComponent } from "vue";
export default defineComponent({
  setup() {
    return {
      catnip: controls.get("catnip"),
    };
  },
  methods: {
    gatherCatnip() {
      controls.gatherCatnip();
    },
    refineCatnip() {
      // controls.refineCatnip();
    },
  },
});
</script>

<style lang="scss" scoped>
@import "../../../node_modules/bootstrap/scss/bootstrap.scss";

:root > div > section {
  & > div {
    @extend .col-6;

    & button {
      @extend .btn, .w-100;

      &.primary {
        @extend .btn-primary;
      }

      &.light {
        @extend .btn-light;
      }
    }
  }
}
</style>