<script setup lang="ts">
import { useI18n } from "vue-i18n";

import Ingredients from "@/components/Controls/Ingredients.vue";

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
    <Ingredients
      class="border-bottom"
      v-if="!item.researched"
      :items="item.fulfillment.ingredients"
    />
    <ul class="effects-list">
      <li v-for="effect in item.effects" :key="effect.id">
        <span>{{ t(effect.label) }}</span>
      </li>
    </ul>
  </div>
</template>
