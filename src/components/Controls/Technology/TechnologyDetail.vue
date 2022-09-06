<script setup lang="ts">
import { useI18n } from "vue-i18n";

import IngredientList from "@/components/Controls/IngredientList.vue";

import { TechItem } from "@/app/presenters";

const { item } = defineProps<{ item: TechItem }>();
const { t } = useI18n();
</script>

<template>
  <div>
    <div class="card-header">
      <p class="description">{{ t(item.description) }}</p>
      <p class="flavor" v-if="item.flavor">{{ t(item.flavor) }}</p>
    </div>
    <IngredientList class="border-bottom" v-if="!item.researched" :items="item.fulfillment.ingredients" />
    <ul class="effects-list">
      <li v-for="effect in item.effects" :key="effect.id">
        <span>{{ t(effect.label) }}</span>
      </li>
    </ul>
  </div>
</template>
