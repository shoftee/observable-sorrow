<script setup lang="ts">
import { toRefs } from "vue";
import { useI18n } from "vue-i18n";

import EffectTree from "@/components/Controls/EffectTree.vue";

import { ResourceView } from "@/app/presenters/views";
import { useFormatter } from "@/composables/game-endpoint";

const { item } = defineProps<{ item: ResourceView }>();

const { t } = useI18n();

const fmt = useFormatter();

const { amount, limit, change, modifier } = toRefs(item);
</script>

<template>
  <div class="item-container">
    <div class="name col-3">
      <span>{{  t(item.label)  }}</span>
      <span v-if="modifier?.value" class="resource-modifier number-annotation" :class="{
        'bg-success': modifier.value > 0,
        'bg-danger': modifier.value < 0,
      }">{{  fmt.v(modifier)  }}</span>
    </div>
    <div class="col-3 number amount">{{  fmt.number(amount, "negative")  }}</div>
    <template v-if="limit">
      <div class="col-3 number capacity">
        <span>/{{  fmt.v(limit)  }}</span>
      </div>
    </template>
    <template v-else>
      <div class="col-3 no-capacity"></div>
    </template>
    <template v-if="change">
      <template v-if="item.deltaTree">
        <tippy class="col-3">
          <div class="number change" :class="{ 'text-danger': change.value < 0 }">
            {{  fmt.v(change)  }}
          </div>
          <template #content>
            <div class="effect-tree">
              <EffectTree :nodes="item.deltaTree.nodes" />
            </div>
          </template>
        </tippy>
      </template>
      <template v-else>
        <div class="col-3 number change" :class="{ 'text-danger': change.value < 0 }">
          {{  fmt.v(change)  }}
        </div>
      </template>
    </template>
    <template v-else>
      <div class="col-3 no-change"></div>
    </template>
  </div>
</template>
