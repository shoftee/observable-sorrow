<script setup lang="ts">
import IngredientItem from "./IngredientItem.vue";

import { IngredientItemView } from "@/app/presenters/common";

const { items } = defineProps<{ items: IngredientItemView[] }>();
</script>

<template>
  <div>
    <ul class="ingredients-list">
      <IngredientItem v-for="item in items" :key="item.id" :item="item" />
    </ul>
  </div>
</template>
  