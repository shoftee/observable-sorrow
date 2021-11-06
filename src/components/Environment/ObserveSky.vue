<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useEndpoint } from "@/composables/game-endpoint";

const { environment, dispatcher } = useEndpoint(ep => {
  return {
    environment: ep.presenters.environment,
    dispatcher: ep.interactors.dispatcher,
  }
})

const { t } = useI18n();

async function observeSky(): Promise<void> {
  await dispatcher.send({ kind: "bonfire", id: "observe-sky" });
}
</script>
<template>
  <button
    v-if="environment.calendar.showObserveSky"
    type="button"
    class="btn-observe-sky"
    @click="observeSky"
  >
    <i class="bi bi-stars"></i>
    {{ t("game.control.observe-sky") }}
  </button>
</template>