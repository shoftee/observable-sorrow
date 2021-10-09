<script setup lang="ts">
import { computed, inject } from "vue";
import { useI18n } from "vue-i18n";

import { UnitKind } from "@/_state";

import { EffectItem, EffectView } from "@/app/presenters";
import { KeyboardEventsKey } from "@/composables/keyboard-events";
import { injectChannel } from "@/composables/game-channel";

const { items } = defineProps<{ items: EffectItem[] }>()

const { t } = useI18n();
const events = inject(KeyboardEventsKey);

const { presenters } = injectChannel();
const fmt = presenters.formatter;

const format = (v: EffectView) => {
  if (v.unit === UnitKind.Percent) {
    return fmt.percent(v.value, "always");
  } else if (v.unit === UnitKind.PerTick) {
    return fmt.number(v.value, "always") + "/t";
  } else {
    return fmt.number(v.value, "always");
  }
};

const title = computed(() =>
  events?.shift
    ? "building-effects.title.total"
    : "building-effects.title.per-level",
);
</script>

<template>
  <div>
    <div class="card-header">{{ t(title) }}</div>
    <ul class="effects-list">
      <li v-for="item in items" :key="item.id">
        <i18n-t scope="global" :keypath="item.label" tag="span">
          <template v-if="item.perLevelAmount" #amount>
            <span class="number">
              {{
                format(events?.shift ? item.totalAmount : item.perLevelAmount)
              }}
            </span>
          </template>
        </i18n-t>
      </li>
    </ul>
  </div>
</template>