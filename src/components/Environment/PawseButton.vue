<script setup lang="ts">
import { computed } from "vue";

import { newTimeView } from "@/app/presenters/views";

import { useI18n } from "vue-i18n";
import { useSend, useStateManager } from "@/composables/game-endpoint";

const send = useSend();
const manager = useStateManager();

const { t } = useI18n();

const time = newTimeView(manager.state);

const label = computed(() => {
  if (time.paused) {
    return "game.control.unpawse";
  } else {
    return "game.control.pawse";
  }
});

async function dispatch() {
  if (time.paused) {
    await send({ kind: "time", id: "unpawse" })
  } else {
    await send({ kind: "time", id: "pawse" })
  }
}
</script>
<template>
  <button type="button" :class="{ active: time.paused }" @click="dispatch">
    {{  t(label)  }}
  </button>
</template>
