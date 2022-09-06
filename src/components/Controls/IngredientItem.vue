<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { IngredientItemView } from "@/app/presenters/common";

import { useFormatter } from "@/composables/game-endpoint";

const { item } = defineProps<{ item: IngredientItemView }>();

const fmt = useFormatter()

const { t } = useI18n();
</script>

<template>
  <li :class="{ unfulfilled: !item.fulfilled }">
    <div class="label">{{ t(item.label) }}</div>
    <div class="fulfillment number">
      <template v-if="!item.fulfilled">
        {{ fmt.number(item.fulfillment) }} / {{ fmt.number(item.requirement) }}
        <template v-if="item.eta !== undefined">
          <template v-if="item.eta.value === Number.POSITIVE_INFINITY">(&infin;)</template>
          <template v-else>({{ fmt.v(item.eta) }})</template>
        </template>
      </template>
      <template v-else>{{ fmt.number(item.requirement) }}</template>
    </div>
  </li>
</template>
 