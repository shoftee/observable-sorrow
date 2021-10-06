
<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import Ingredients from "./Ingredients.vue";
import Effects from "./Effects.vue";

import { BonfireItemId } from "@/_interfaces";
import { Interactor } from "@/app/os";
import { BonfireItem } from "@/app/presenters";

const { item } = defineProps<{ item: BonfireItem }>();

const { t } = { ...useI18n() };
const level = computed(() => item.level ?? 0)
const ingredients = computed(() => item.ingredients ?? []);
const effects = computed(() => item.effects ?? []);

async function buildItem(id: BonfireItemId): Promise<void> {
  await Interactor.buildItem(id);
}
</script>

<template>
  <tippy>
    <!-- We need a container div because tippy listens to hover events to trigger and buttons don't fire events when disabled.-->
    <div>
      <button
        type="button"
        class="btn btn-outline-secondary w-100"
        :class="{ capped: item.capped }"
        :disabled="!item.fulfilled"
        @click="buildItem(item.id)"
      >
        {{ t(item.label) }}
        <span v-if="level > 0" class="structure-level">{{ level }}</span>
      </button>
    </div>
    <template #content>
      <div>
        <div class="card-header">
          <p class="description">{{ t(item.description) }}</p>
          <p class="flavor" v-if="item.flavor">{{ t(item.flavor) }}</p>
        </div>
        <Ingredients v-if="ingredients.length > 0" :items="ingredients" />
        <Effects v-if="effects.length > 0" :items="effects" />
      </div>
    </template>
  </tippy>
</template>
