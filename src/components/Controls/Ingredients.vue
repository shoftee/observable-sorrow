<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { IngredientItem } from "@/app/presenters";
import { useFormatter } from "@/composables/presenters";

const { items } = defineProps<{ items: IngredientItem[] }>();

const { t } = { ...useI18n() };
const fmt = useFormatter();
</script>

<template>
  <div>
    <ul class="ingredients-list">
      <li v-for="item in items" :key="item.id" :class="{ unfulfilled: !item.fulfilled }">
        <div class="ingredient-label">{{ t(item.label) }}</div>
        <div class="ingredient-fulfillment number">
          <template v-if="!item.fulfilled">
            {{ fmt.number(item.fulfillment) }} /
            {{ fmt.number(item.requirement) }}
            <template
              v-if="item.fulfillmentTime"
            >({{ fmt.rounded(item.fulfillmentTime) }}t)</template>
          </template>
          <template v-else>{{ fmt.number(item.requirement) }}</template>
        </div>
      </li>
    </ul>
  </div>
</template>