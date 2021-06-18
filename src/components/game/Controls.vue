<template>
  <div class="controls">
    <section class="row">
      <os-button
        :class="{ disabled: catnip.amount == catnip.capacity }"
        @click="gatherCatnip()"
      >
        Gather button
      </os-button>
      <os-button>Refine catnip</os-button>
    </section>
  </div>
</template>

<script lang="ts">
import Os from "@/app/os";

const controls = Os.interactors.controls;

import Button from "../global/Button.vue";

import { defineComponent } from "vue";
export default defineComponent({
  components: {
    "os-button": Button,
  },
  setup() {
    return {
      catnip: controls.get("catnip"),
    };
  },
  methods: {
    gatherCatnip() {
      controls.gatherCatnip();
    },
  },
});
</script>