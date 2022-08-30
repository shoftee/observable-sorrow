<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useSend, useStateManager } from "@/composables/game-endpoint";

import { newAstronomyView } from "@/app/presenters/views";

const send = useSend()
const manager = useStateManager()

const { t } = useI18n();

const astronomy = newAstronomyView(manager);

async function observeSky(): Promise<void> {
  await send({ kind: "astronomy", id: "observe-sky" });
}
</script>
<template>
  <button v-if="astronomy.hasRareEvent" type="button" class="btn-observe-sky" @click="observeSky">
    <i class="bi bi-stars"></i>
    {{  t("game.control.observe-sky")  }}
  </button>
</template>
