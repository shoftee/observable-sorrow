<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { useSend, useStateManager } from "@/composables/game-endpoint";
import { newTimeView } from "@/app/presenters/views";

const send = useSend();
const manager = useStateManager();

const { t } = useI18n();

const time = newTimeView(manager.state);

async function pause() {
  await send({ kind: "time", id: "pawse" })
}
async function unpause() {
  await send({ kind: "time", id: "unpawse" })
}
</script>
<template>
  <button type="button" :class="{ active: time.paused }" @click="time.paused ? unpause() : pause()">
    {{ t(time.paused ? "game.control.unpawse" : "game.control.pawse") }}
  </button>
</template>
