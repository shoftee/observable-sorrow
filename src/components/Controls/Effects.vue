<script setup lang="ts">
import { inject } from "vue";

import { EffectItem } from "@/app/presenters";
import { KeyboardEventsKey } from "@/composables/keyboard-events";
import { injectChannel } from "@/composables/game-channel";

const { items } = defineProps<{ items: EffectItem[] }>()
const events = inject(KeyboardEventsKey);

const { presenters } = injectChannel();
const fmt = presenters.formatter;
</script>

<template>
  <div>
    <div class="card-header">
      <slot name="title">Effects</slot>
    </div>
    <ul class="effects-list">
      <li v-for="item in items" :key="item.id">
        <i18n-t scope="global" :keypath="item.label" tag="span">
          <template #amount>
            <span class="number">
              {{
                fmt.v(events?.shift ? item.totalAmount : item.singleAmount)
              }}
            </span>
          </template>
        </i18n-t>
      </li>
    </ul>
  </div>
</template>