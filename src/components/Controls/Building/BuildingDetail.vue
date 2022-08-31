<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import IngredientList from "../IngredientList.vue";
import EffectList from "../EffectList.vue";

import { BonfireItemView } from "@/app/presenters/views";

import { useKeyboardEvents } from "@/composables/keyboard-events";

const { item } = defineProps<{ item: BonfireItemView }>();

const { t } = useI18n();
const events = useKeyboardEvents();

const ingredients = computed(() => item.fulfillment.ingredients);
const effects = computed(() => item.effects ?? []);
const title = computed(() => {
  if (events.shift) {
    return "effects.buildings.total";
  } else {
    return "effects.buildings.per-level";
  }
})
</script>
<template>
  <div>
    <div class="card-header">
      <p class="description">{{  t(item.description)  }}</p>
      <p class="flavor" v-if="item.flavor">{{  t(item.flavor)  }}</p>
    </div>
    <IngredientList v-if="ingredients.length > 0" :items="ingredients" />
    <EffectList v-if="effects.length > 0" :items="effects">
      <template #title>{{  t(title)  }}</template>
    </EffectList>
  </div>
</template>
