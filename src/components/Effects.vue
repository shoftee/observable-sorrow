<script lang="ts">
import { computed, defineComponent, inject } from "vue";
import { useI18n } from "vue-i18n";

import { Presenters } from "@/app/os";
import { KeyboardEventsKey } from "@/composables/keyboard-events";
import { EffectItem } from "@/app/presenters";

export default defineComponent({
  props: {
    items: Array,
  },
  setup() {
    const { t } = { ...useI18n() };
    const events = inject(KeyboardEventsKey);
    const formatter = Presenters.formatter;
    const title = computed(() =>
      events?.shift
        ? "building-effects.title.total"
        : "building-effects.title.per-level",
    );
    const eff = computed(
      () => (item: EffectItem) =>
        events?.shift
          ? formatter.number(item.totalAmount, "always")
          : formatter.number(item.perLevelAmount, "always"),
    );
    return { t, events, formatter, title, eff };
  },
});
</script>

<template>
  <div>
    <div class="card-header">
      {{ t(title) }}
    </div>
    <ul class="effects-list">
      <li v-for="item in items" :key="item.id">
        <i18n-t scope="global" :keypath="item.label" tag="span">
          <template v-if="item.perLevelAmount" #amount>
            <span class="number"> {{ eff(item) }}/t </span>
          </template>
        </i18n-t>
      </li>
    </ul>
  </div>
</template>