<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { EffectTreeNode } from "@/app/presenters/common";
import { useEndpoint } from "@/composables/game-endpoint";

const { nodes } = defineProps<{ nodes: EffectTreeNode[] }>();

const { fmt } = useEndpoint(ep => {
  return { fmt: ep.presenters.formatter }
})

const { t } = useI18n();

const nonZeroNodes = computed(() => nodes.filter(node => (node.value?.value ?? 0) !== 0))
</script>

<template>
  <ul class="effects-list">
    <li v-for="node in nonZeroNodes" :key="node.id">
      <span class="label" v-if="node.label">{{ t(node.label) }}</span>
      <span class="amount number">{{ fmt.v(node.value!) }}</span>
      <EffectTree v-if="node.nodes.length > 0" :nodes="node.nodes" />
    </li>
  </ul>
</template>