<script setup lang="ts">
import { useEndpoint } from "@/composables/game-endpoint";
import { computed } from "vue";

import EffectTree from "./EffectTree.vue";

const { society, fmt } = useEndpoint(ep => {
  return {
    society: ep.presenters.society,
    fmt: ep.presenters.formatter,
  }
})

const icon = computed(() => {
  const happiness = society.happiness.view.value;
  if (happiness !== undefined) {
    const thresholds = [
      { threshold: 10, class: "bi-emoji-sunglasses" },
      { threshold: 2, class: "bi-emoji-laughing" },
      { threshold: .9, class: "bi-emoji-smile" },
      { threshold: .7, class: "bi-emoji-neutral" },
      { threshold: .6, class: "bi-emoji-expressionless" },
      { threshold: .5, class: "bi-emoji-frown" },
      { threshold: .25, class: "bi-emoji-angry" },
      { threshold: 0, class: "bi-emoji-dizzy" },
    ];

    for (const item of thresholds) {
      if (happiness > item.threshold) {
        return item.class;
      }
    }
  }

  return "bi-emoji-neutral";
})

const { happiness } = society;
</script>

<template>
  <div class="text-center">
    <div v-if="happiness.view.value !== undefined">
      <tippy>
        <div class="d-flex align-items-baseline">
          <span class="bi" :class="{ [icon]: true }"></span>
          <span class="ms-2 number">{{ fmt.v(happiness.view) }}</span>
        </div>
        <template #content>
          <div class="effect-tree">
            <EffectTree :nodes="happiness.effectTree.nodes" />
          </div>
        </template>
      </tippy>
    </div>
  </div>
</template>