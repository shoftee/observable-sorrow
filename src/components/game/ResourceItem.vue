<template>
  <div class="d-inline-flex align-items-center">
    <div class="name col-3">
      <span>{{ t(item.label) }}</span>
      <span
        v-if="item.modifier"
        class="ms-1 badge badge-light"
        :class="{
          'bg-success': item.modifier > 0,
          'bg-danger': item.modifier < 0,
        }"
        >{{ p(item.modifier) }}</span
      >
    </div>
    <div class="col-3 number amount">{{ n(item.amount) }}</div>
    <template v-if="item.capacity">
      <div class="col-3 number capacity">/ {{ n(item.capacity) }}</div>
    </template>
    <template v-else>
      <div class="col-3 no-capacity"></div>
    </template>
    <template v-if="item.change">
      <div class="col-3 number change">{{ n(item.change, true) }}/t</div>
    </template>
    <template v-else>
      <div class="col-3 no-change"></div>
    </template>
  </div>
</template>

<script lang="ts">
import { ListItem } from "@/app/resources";

import { Presenter } from "@/app/os";
const notation = Presenter.numbers;

import { defineComponent, PropType } from "vue";
import { useI18n } from "vue-i18n";

export default defineComponent({
  props: {
    item: {
      type: Object as PropType<ListItem>,
      required: true,
    },
  },
  setup() {
    const { t } = { ...useI18n() };
    const n = (v: number) => notation.number(v, 3, "negative");
    const p = (v: number) => notation.percent(v, 0, "always");
    return { t, n, p };
  },
});
</script>