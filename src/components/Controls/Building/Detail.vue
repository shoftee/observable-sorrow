<script setup lang="ts">
import { computed, inject } from "vue";
import { useI18n } from "vue-i18n";

import Ingredients from "../Ingredients.vue";
import Effects from "../Effects.vue";

import { BonfireItemView } from "@/app/presenters/views";

import { KeyboardEventsKey } from "@/composables/keyboard-events";

const { item } = defineProps<{ item: BonfireItemView }>();
const { t } = useI18n();
const events = inject(KeyboardEventsKey);

const ingredients = computed(() => item.fulfillment.ingredients);
const effects = computed(() => item.effects ?? []);
</script>
<template>
  <div>
    <div class="card-header">
      <p class="description">{{ t(item.description) }}</p>
      <p class="flavor" v-if="item.flavor">{{ t(item.flavor) }}</p>
    </div>
    <Ingredients v-if="ingredients.length > 0" :items="ingredients" />
    <Effects v-if="effects.length > 0" :items="effects">
      <template #title>{{
          t(
            events?.shift
              ? "effects.buildings.total"
              : "effects.buildings.per-level",
          )
      }}</template>
    </Effects>
  </div>
</template>
