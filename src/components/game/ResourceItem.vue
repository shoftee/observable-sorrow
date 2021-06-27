<template>
  <div class="d-inline-flex align-items-center align-items-stretch">
    <div class="name">
      <span>{{ t(item.label) }}</span>
      <!-- <span class="badge bg-danger badge-light">!</span> -->
    </div>
    <div class="mx-1 amount">{{ n(item.amount) }}</div>
    <template v-if="item.capacity">
      <div class="slash">/</div>
      <div class="mx-1 capacity">{{ n(item.capacity) }}</div>
    </template>
    <template v-else>
      <div class="no-capacity"></div>
    </template>
    <div class="change" v-if="item.change">{{ n(item.change, true) }}/t</div>
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
    const n = (v: number, signed = false) => notation.display(v, 3, signed);
    return { t, n };
  },
});
</script>