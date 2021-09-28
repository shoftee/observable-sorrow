<script lang="ts">
import { defineComponent, PropType } from "vue";
import { useI18n } from "vue-i18n";

import { ListItem } from "@/app/resources";
import { Presenter } from "@/app/os";

export default defineComponent({
  props: {
    item: {
      type: Object as PropType<ListItem>,
      required: true,
    },
  },
  setup() {
    const { t } = { ...useI18n() };

    const formatter = Presenter.numbers;
    const res = (v: number) => formatter.number(v, "negative");
    const eff = (v: number) => formatter.number(v, "always");
    const per = (v: number) => formatter.percent(v, "always");

    return { t, res, eff, per };
  },
});
</script>

<template>
  <div class="d-inline-flex align-items-center">
    <div class="name col-3">
      <span>{{ t(item.label) }}</span>
      <span
        v-if="item.modifier"
        class="ms-1 p-1 badge badge-light"
        :class="{
          'bg-success': item.modifier > 0,
          'bg-danger': item.modifier < 0,
        }"
      >
        {{ per(item.modifier) }}
      </span>
    </div>
    <div class="col-3 number amount">{{ res(item.amount) }}</div>
    <template v-if="item.capacity">
      <div class="col-3 number capacity">/ {{ res(item.capacity) }}</div>
    </template>
    <template v-else>
      <div class="col-3 no-capacity"></div>
    </template>
    <template v-if="item.change">
      <div class="col-3 number change">{{ eff(item.change, true) }}/t</div>
    </template>
    <template v-else>
      <div class="col-3 no-change"></div>
    </template>
  </div>
</template>
