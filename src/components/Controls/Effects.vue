<script setup lang="ts">
import { inject } from "vue";

import { EffectItem } from "@/app/presenters";
import { KeyboardEventsKey } from "@/composables/keyboard-events";
import { endpoint } from "@/composables/game-endpoint";

const { items } = defineProps<{ items: EffectItem[] }>()
const events = inject(KeyboardEventsKey);

const { presenters } = endpoint();
const fmt = presenters.formatter;
</script>

<template>
  <div>
    <div class="card-header">
      <slot name="title">Effects</slot>
    </div>
    <ul class="effects-list">
      <template v-if="events?.shift">
        <li v-for="item in items.filter(i => i.totalAmount !== undefined)" :key="item.id">
          <i18n-t scope="global" :keypath="item.label" tag="span">
            <template #amount>
              <span class="number">{{ fmt.v(item.totalAmount!) }}</span>
            </template>
          </i18n-t>
        </li>
      </template>
      <template v-else>
        <li v-for="item in items.filter(i => i.singleAmount !== undefined)" :key="item.id">
          <i18n-t scope="global" :keypath="item.label" tag="span">
            <template #amount>
              <span class="number">{{ fmt.v(item.singleAmount!) }}</span>
            </template>
          </i18n-t>
        </li>
      </template>
    </ul>
  </div>
</template>