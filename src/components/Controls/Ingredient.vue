<script setup lang="ts">
import { toRefs } from 'vue';
import { useI18n } from 'vue-i18n';

import { injectChannel } from '@/composables/game-channel';
import { IngredientItem } from '@/app/presenters';

const { item } = defineProps<{ item: IngredientItem }>();

const { t } = useI18n();

const { presenters } = injectChannel();
const fmt = presenters.formatter;

const { label, fulfilled, fulfillment, requirement, fulfillmentTime } = toRefs(item);
</script>

<template>
  <li :class="{ unfulfilled: !fulfilled }">
    <div class="label">{{ t(label) }}</div>
    <div class="fulfillment number">
      <template v-if="!fulfilled">
        {{ fmt.number(fulfillment) }} /
        {{ fmt.number(requirement) }}
        <template
          v-if="fulfillmentTime !== undefined"
        >
          <template v-if="fulfillmentTime.value === Number.POSITIVE_INFINITY">(&infin;)</template>
          <template v-else>({{ fmt.v(fulfillmentTime) }})</template>
        </template>
      </template>
      <template v-else>{{ fmt.number(requirement) }}</template>
    </div>
  </li>
</template>