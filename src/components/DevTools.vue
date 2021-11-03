<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Offcanvas } from "bootstrap"

import { useEndpoint } from "@/composables/game-endpoint";
import { useKeyboardEvent } from "@/composables/use-event-listener";

const { devTools, player } = useEndpoint(ep => {
  return {
    devTools: ep.interactors.devTools,
    player: ep.presenters.player,
  }
})

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

const timeAcceleration = computed({
  get: () => options.timeAcceleration,
  set: async (newValue: number) => {
    await devTools.setTimeAcceleration(newValue)
  }
});

useKeyboardEvent("keyup", (e) => {
  if (e.code === "Backquote") {
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
      class="btn btn-danger shadow-none"
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
          <label for="time-acceleration" class="form-label">
            Time Acceleration =
            10
            <sup>{{ timeAcceleration }}</sup>
          </label>
          <input
            id="time-acceleration"
            type="range"
            class="form-range"
            min="0"
            max="2"
            step="0.1"
            v-model.number="timeAcceleration"
          />
        </div>
      </div>
    </div>
  </aside>
</template>