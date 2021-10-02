<script lang="ts">
import { defineComponent, PropType } from "vue";
import { useI18n } from "vue-i18n";

import { Resource } from "@/app/presenters/resources";
import { Presenters } from "@/app/os";

export default defineComponent({
  props: {
    item: {
      type: Object as PropType<Resource>,
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
        {{ formatter.percent(item.modifier, "always") }}
      </span>
    </div>
    <div class="col-3 number amount">
      {{ formatter.number(item.amount, "negative") }}
    </div>
    <template v-if="item.capacity">
      <div class="col-3 number capacity">
        / {{ formatter.number(item.capacity, "negative") }}
      </div>
    </template>
    <template v-else>
      <div class="col-3 no-capacity"></div>
    </template>
    <template v-if="item.change">
      <div class="col-3 number change">
        {{ formatter.number(item.change, "always") }}/t
      </div>
    </template>
    <template v-else>
      <div class="col-3 no-change"></div>
    </template>
  </div>
</template>
