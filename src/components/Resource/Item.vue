<script setup lang="ts">
import { computed, toRefs, unref } from "vue";
import { useI18n } from "vue-i18n";

import { ResourceItem } from "@/app/presenters/resources";
import { injectChannel } from "@/composables/game-channel";

const { item } = defineProps<{ item: ResourceItem }>();

const { t } = useI18n();

const { presenters } = injectChannel();
const fmt = presenters.formatter;

const { amount, capacity, change, modifier } = toRefs(item);
const isDeficit = computed(() => unref(change).value < 0);
</script>

<template>
  <div class="d-inline-flex align-items-center">
    <div class="name col-3">
      <span>{{ t(item.label) }}</span>
      <span
        v-if="modifier?.value"
        class="resource-modifier number"
        :class="{
          'bg-success': modifier.value > 0,
          'bg-danger': modifier.value < 0,
        }"
      >{{ fmt.v(modifier) }}</span>
    </div>
    <div class="col-3 number amount">{{ fmt.number(amount, "negative") }}</div>
    <template v-if="capacity">
      <div class="col-3 number capacity">
        <span>/{{ fmt.number(capacity, "negative") }}</span>
      </div>
    </template>
    <template v-else>
      <div class="col-3 no-capacity"></div>
    </template>
    <template v-if="change.value">
      <div class="col-3 number change" :class="{ 'text-danger': isDeficit }">{{ fmt.v(change) }}</div>
    </template>
    <template v-else>
      <div class="col-3 no-change"></div>
    </template>
  </div>
</template>
