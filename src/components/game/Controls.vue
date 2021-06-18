<template>
  <div class="controls">
    <section class="row">
      <os-button @click="gatherCatnip()">
        <template #default>Gather catnip</template>
        <template #tooltip> Gather some catnip in the forest. </template>
      </os-button>
      <os-button :disabled="true" @click="refineCatnip()">
        <template #default>Refine catnip</template>
        <template #tooltip>
          <div>Refine catnip into catnip wood.</div>
          <hr />
          <div class="clearfix">
            <div class="float-start">catnip</div>
            <div class="float-end">50</div>
          </div>
        </template>
      </os-button>
    </section>
  </div>
</template>

<script lang="ts">
import Os from "@/app/os";

const controls = Os.interactors.controls;

import Button from "../global/Button.vue";

import { defineComponent } from "vue";
export default defineComponent({
  components: { "os-button": Button },
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