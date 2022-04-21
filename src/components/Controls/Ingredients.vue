<script setup lang="ts">
import Ingredient from "./Ingredient.vue";

import { IngredientItem } from "@/app/presenters/common";

const { items } = defineProps<{ items: IngredientItem[] }>();
</script>

<template>
  <div>
    <ul class="ingredients-list">
      <Ingredient v-for="item in items" :key="item.id" :item="item" />
    </ul>
  </div>
</template>
