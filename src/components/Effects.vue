<script lang="ts">
import { computed, defineComponent, inject } from "vue";
import { useI18n } from "vue-i18n";

import { Presenters } from "@/app/os";
import { KeyboardEventsKey } from "@/composables/keyboard-events";
import { EffectView } from "@/app/presenters";
import { UnitKind } from "@/_state";

export default defineComponent({
  props: {
    items: Array,
  },
  setup() {
    const { t } = { ...useI18n() };
    const events = inject(KeyboardEventsKey);

    const fmt = Presenters.formatter;
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
    return { t, events, format, title };
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