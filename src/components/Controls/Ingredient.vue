<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { IngredientItem } from "@/app/presenters/common";
import { useEndpoint } from "@/composables/game-endpoint";

const { item } = defineProps<{ item: IngredientItem }>();

const { fmt } = useEndpoint(ep => {
  return { fmt: ep.presenters.formatter };
})

const { t } = useI18n();
</script>

<template>
  <li :class="{ unfulfilled: !item.fulfilled }">
    <div class="label">{{ t(item.label) }}</div>
    <div class="fulfillment number">
      <template v-if="!item.fulfilled">
        {{ fmt.number(item.fulfillment) }} /
        {{ fmt.number(item.requirement) }}
        <template
          v-if="item.fulfillmentTime !== undefined"
        >
          <template v-if="item.fulfillmentTime.value === Number.POSITIVE_INFINITY">(&infin;)</template>
          <template v-else>({{ fmt.v(item.fulfillmentTime) }})</template>
        </template>
      </template>
      <template v-else>{{ fmt.number(item.requirement) }}</template>
    </div>
  </li>
</template>