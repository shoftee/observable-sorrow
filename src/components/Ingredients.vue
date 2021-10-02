<script lang="ts">
import { defineComponent } from "vue";

import { Presenters } from "@/app/os";
import { useI18n } from "vue-i18n";

export default defineComponent({
  props: {
    items: {
      type: Array,
      required: true,
    },
  },
  setup() {
    const { t } = { ...useI18n() };
    const formatter = Presenters.formatter;
    return { t, formatter };
  },
});
</script>

<template>
  <div>
    <ul class="ingredients-list">
      <li
        v-for="item in items"
        :key="item.id"
        :class="{ unfulfilled: !item.fulfilled }"
      >
        <div class="ingredient-label">
          {{ t(item.label) }}
        </div>
        <div class="ingredient-fulfillment number">
          <span v-if="!item.fulfilled">
            {{ formatter.number(item.fulfillment, "negative") }} /
          </span>
          {{ formatter.number(item.requirement, "negative") }}
        </div>
      </li>
    </ul>
  </div>
</template>