<script setup lang="ts">
import { ref, watch } from "vue";
import { Offcanvas } from "bootstrap"

import { injectChannel } from "@/composables/game-channel";
import { useKeyboardEvent } from "@/composables/use-event-listener";

const { devTools } = injectChannel().interactors;
const { player } = injectChannel().presenters;

const dt = window.__OS_DEVTOOLS__;
watch(() => dt.on, async (newValue, oldValue) => {
  if (!newValue && oldValue) {
    await devTools.turnDevToolsOff();
  } else if (newValue && !oldValue) {
    await devTools.turnDevToolsOn();
  }
}, { immediate: true });

const options = player.state;
const gatherCatnip = ref(options.gatherCatnip);
const timeAcceleration = ref(options.timeAcceleration);

useKeyboardEvent("keyup", (e) => {
  if (e.key === "`") {
    Offcanvas.getOrCreateInstance("#dt-offcanvas")?.toggle();
  }
});
</script>
<template>
  <aside>
    <button
      id="show-devtools"
      type="button"
      data-bs-toggle="offcanvas"
      data-bs-target="#dt-offcanvas"
      class="btn btn-outline-secondary position-fixed m-5 bottom-0 end-0"
    >
      <span class="bi bi-gear"></span>
    </button>
    <div id="dt-offcanvas" class="offcanvas offcanvas-end" tabindex="-1">
      <div class="offcanvas-header">Dev Tools</div>
      <div class="offcanvas-body">
        <div class="row">
          <label for="gather-catnip" class="form-label">Gather Catnip = {{ gatherCatnip }}</label>
          <input
            id="gather-catnip"
            type="range"
            class="form-range"
            min="1"
            max="100"
            v-model.number="gatherCatnip"
            @change="devTools.setGatherCatnip(gatherCatnip)"
          />
        </div>
        <div class="row">
          <label
            for="time-acceleration"
            class="form-label"
          >Time Acceleration = {{ timeAcceleration }}</label>
          <input
            id="time-acceleration"
            type="range"
            class="form-range"
            min="0.5"
            max="10"
            step="0.1"
            v-model.number="timeAcceleration"
            @change="devTools.setTimeAcceleration(timeAcceleration)"
          />
        </div>
      </div>
    </div>
  </aside>
</template>