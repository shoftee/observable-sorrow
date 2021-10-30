<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { endpoint } from '@/composables/game-endpoint';

const { environment } = endpoint().presenters;
const { dispatcher } = endpoint().interactors;
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