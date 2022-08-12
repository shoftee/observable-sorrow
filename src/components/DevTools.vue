<script setup lang="ts">
import { computed } from "vue";
import { Offcanvas } from "bootstrap";

import { useSend, useStateManager } from "@/composables/game-endpoint";
import { useKeyboardEvent } from "@/composables/use-event-listener";
import { newTimeView } from "@/app/presenters/views";

const manager = useStateManager()
const send = useSend();

const time = newTimeView(manager)

const acceleration = computed({
  get: () => {
    return time.power;
  },
  set: async (newValue: number) => {
    await send({ kind: "time", id: "set-power", power: newValue });
  },
});

useKeyboardEvent("keyup", (e) => {
  if (e.code === "Backquote") {
    Offcanvas.getOrCreateInstance("#dt-offcanvas")?.toggle();
  }
});
</script>
<template>
  <aside>
    <button id="show-devtools" type="button" data-bs-toggle="offcanvas" data-bs-target="#dt-offcanvas"
      class="btn btn-danger shadow-none">
      <span class="bi bi-gear"></span>
    </button>
    <div id="dt-offcanvas" class="offcanvas offcanvas-end" tabindex="-1">
      <div class="offcanvas-header">Dev Tools</div>
      <div class="offcanvas-body">
        <div class="row">
          <label for="time-acceleration" class="form-label">
            Time Acceleration = <span class="number">10<sup>{{ acceleration }}</sup></span>
          </label>
          <input id="time-acceleration" type="range" class="form-range" min="0" max="2" step="0.1"
            v-model.number="acceleration" />
        </div>
      </div>
    </div>
  </aside>
</template>
