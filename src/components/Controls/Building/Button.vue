<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import Detail from "./Detail.vue"

import { BonfireItemId } from "@/app/interfaces";
import { BonfireItem } from "@/app/presenters";
import { injectChannel } from "@/composables/game-channel";

const { item } = defineProps<{ item: BonfireItem }>();
const { t } = useI18n();

const level = computed(() => item.level ?? 0)

const interactors = injectChannel().interactors;

async function buildItem(id: BonfireItemId): Promise<void> {
  await interactors.bonfire.buildItem(id)
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
        @click="buildItem(item.id)"
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
