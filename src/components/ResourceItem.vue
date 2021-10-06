<script setup lang="ts">
import { toRefs } from "vue";
import { useI18n } from "vue-i18n";

import { ResourceItem } from "@/app/presenters/resources";
import { useFormatter } from "@/composables/presenters";

const { item } = defineProps<{ item: ResourceItem }>();
const { amount, capacity, change, modifier } = toRefs(item);
const { t } = { ...useI18n() };
const fmt = useFormatter();
</script>

<template>
  <div class="d-inline-flex align-items-center">
    <div class="name col-3">
      <span>{{ t(item.label) }}</span>
      <span
        v-if="modifier"
        class="resource-modifier number"
        :class="{
          'bg-success': modifier > 0,
          'bg-danger': modifier < 0,
        }"
      >{{ fmt.percent(modifier, "always") }}</span>
    </div>
    <div class="col-3 number amount">{{ fmt.number(amount, "negative") }}</div>
    <template v-if="capacity">
      <div class="col-3 number capacity">/ {{ fmt.number(capacity, "negative") }}</div>
    </template>
    <template v-else>
      <div class="col-3 no-capacity"></div>
    </template>
    <template v-if="change">
      <div class="col-3 number change">{{ fmt.number(change, "always") }}/t</div>
    </template>
    <template v-else>
      <div class="col-3 no-change"></div>
    </template>
  </div>
</template>
