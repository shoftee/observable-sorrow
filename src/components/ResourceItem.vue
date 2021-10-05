<script lang="ts">
import { defineComponent, PropType } from "vue";
import { useI18n } from "vue-i18n";

import { ResourceItem } from "@/app/presenters/resources";
import { Presenters } from "@/app/os";

export default defineComponent({
  props: {
    item: {
      type: Object as PropType<ResourceItem>,
      required: true,
    },
  },
  setup() {
    const { t } = { ...useI18n() };
    const fmt = Presenters.formatter;
    return { t, fmt };
  },
});
</script>

<template>
  <div class="d-inline-flex align-items-center">
    <div class="name col-3">
      <span>{{ t(item.label) }}</span>
      <span
        v-if="item.modifier"
        class="resource-modifier number"
        :class="{
          'bg-success': item.modifier > 0,
          'bg-danger': item.modifier < 0,
        }"
      >
        {{ fmt.percent(item.modifier, "always") }}
      </span>
    </div>
    <div class="col-3 number amount">
      {{ fmt.number(item.amount, "negative") }}
    </div>
    <template v-if="item.capacity">
      <div class="col-3 number capacity">
        / {{ fmt.number(item.capacity, "negative") }}
      </div>
    </template>
    <template v-else>
      <div class="col-3 no-capacity"></div>
    </template>
    <template v-if="item.change">
      <div class="col-3 number change">
        {{ fmt.number(item.change, "always") }}/t
      </div>
    </template>
    <template v-else>
      <div class="col-3 no-change"></div>
    </template>
  </div>
</template>
