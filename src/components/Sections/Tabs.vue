<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import { SectionId } from "@/app/interfaces";
import { useEndpoint } from "@/composables/game-endpoint";

const props = defineProps<{ active: SectionId }>();
const emit = defineEmits<{
  (e: "changed", section: SectionId): void,
}>();

const { sections } = useEndpoint(ep => {
  return {
    sections: Array.from(ep.presenters.section.items.values()),
  }
})

const { t } = useI18n();
const active = ref(props.active);
const topLevelSections = computed(() => sections.filter(s => s.unlocked && s.parentId === undefined));

function onTabClick(id: SectionId) {
  active.value = id
  emit("changed", id);
}
</script>
<template>
  <ul class="nav nav-pills">
    <li class="nav-item" v-for="section in topLevelSections" :key="section.id">
      <button
        class="btn nav-link"
        :class="{
          active: section.id === active,
          disabled: sections.length < 2
        }"
        @click="onTabClick(section.id)"
      >
        <slot>
          {{ t(section.label) }}
          <span
            v-if="section.alert"
            class="number-annotation bg-danger"
          >{{ section.alert }}</span>
        </slot>
      </button>
    </li>
  </ul>
</template>