<script setup lang="ts">
import { useI18n } from "vue-i18n";

import EffectTree from "@/components/Controls/EffectTree.vue";

import { ResourceView } from "@/app/presenters/views";
import { useFormatter } from "@/composables/game-endpoint";

const { item } = defineProps<{ item: ResourceView }>();

const { t } = useI18n();

const fmt = useFormatter();
</script>

<template>
  <div class="item-container">
    <div class="name col-3">
      <span>{{  t(item.label)  }}</span>
      <template v-if="item.modifier">
        <span v-if="item.modifier.value" class="resource-modifier number-annotation" :class="{
          'bg-success': item.modifier.value > 0,
          'bg-danger': item.modifier.value < 0,
        }">{{  fmt.v(item.modifier)  }}</span>
      </template>
    </div>
    <div class="col-3 number amount">{{  fmt.number(item.amount, "negative")  }}</div>
    <template v-if="item.limit">
      <div class="col-3 number capacity">
        <span>/{{  fmt.v(item.limit)  }}</span>
      </div>
    </template>
    <template v-else>
      <div class="col-3 no-capacity"></div>
    </template>
    <template v-if="item.change">
      <template v-if="item.deltaTree">
        <tippy class="col-3">
          <div class="number change" :class="{ 'text-danger': item.change.value < 0 }">
            {{  fmt.v(item.change)  }}
          </div>
          <template #content>
            <div class="effect-tree">
              <EffectTree :nodes="item.deltaTree.nodes" />
            </div>
          </template>
        </tippy>
      </template>
      <template v-else>
        <div class="col-3 number change" :class="{ 'text-danger': item.change.value < 0 }">
          {{  fmt.v(item.change)  }}
        </div>
      </template>
    </template>
    <template v-else>
      <div class="col-3 no-change"></div>
    </template>
  </div>
</template>
