<script setup lang="ts">
import { toRefs } from "vue";
import { useI18n } from "vue-i18n";

import EffectTree from "@/components/Controls/EffectTree.vue";

import { ResourceItem } from "@/app/presenters/resources";
import { useEndpoint } from "@/composables/game-endpoint";

const { item } = defineProps<{ item: ResourceItem }>();

const { t } = useI18n();

const { fmt } = useEndpoint((ep) => {
  return { fmt: ep.presenters.formatter };
});

const { amount, capacity, change, modifier } = toRefs(item);
</script>

<template>
  <div class="item-container">
    <div class="name col-3">
      <span>{{ t(item.label) }}</span>
      <span
        v-if="modifier?.value"
        class="resource-modifier number-annotation"
        :class="{
          'bg-success': modifier.value > 0,
          'bg-danger': modifier.value < 0,
        }"
        >{{ fmt.v(modifier) }}</span
      >
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
      <template v-if="item.deltaTree">
        <tippy class="col-3">
          <div
            class="number change"
            :class="{ 'text-danger': change.value < 0 }"
          >
            {{ fmt.v(change) }}
          </div>
          <template #content>
            <div class="effect-tree">
              <EffectTree :nodes="item.deltaTree.nodes" />
            </div>
          </template>
        </tippy>
      </template>
      <template v-else>
        <div
          class="col-3 number change"
          :class="{ 'text-danger': change.value < 0 }"
        >
          {{ fmt.v(change) }}
        </div>
      </template>
    </template>
    <template v-else>
      <div class="col-3 no-change"></div>
    </template>
  </div>
</template>
