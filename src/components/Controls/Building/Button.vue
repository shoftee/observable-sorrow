<script setup lang="ts">
import { computed, toRaw } from "vue";
import { useI18n } from "vue-i18n";

import Detail from "./Detail.vue"

import { BonfireItem } from "@/app/presenters";
import { injectChannel } from "@/composables/game-channel";
import { Intent } from "@/app/interfaces";

const { item } = defineProps<{ item: BonfireItem }>();
const { t } = useI18n();

const level = computed(() => item.level ?? 0)

const { dispatcher } = injectChannel().interactors;

async function dispatch(intent: Intent): Promise<void> {
  await dispatcher.send(toRaw(intent))
}
</script>

<template>
  <tippy>
    <!-- We need a container div because tippy listens to hover events to trigger and buttons don't fire events when disabled.-->
    <div>
      <button
        type="button"
        class="btn btn-outline-secondary w-100"
        :class="{ capped: item.fulfillment.capped }"
        :disabled="!item.fulfillment.fulfilled"
        @click="dispatch(item.intent)"
      >
        {{ t(item.label) }}
        <span v-if="level > 0" class="number-annotation border">{{ level }}</span>
      </button>
    </div>
    <template #content>
      <Detail :item="item" />
    </template>
  </tippy>
</template>
