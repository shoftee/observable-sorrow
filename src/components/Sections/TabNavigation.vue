<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import { SectionId } from "@/app/interfaces";
import { useStateManager } from "@/composables/game-endpoint";

import { allSectionViews, filterArrayView } from "@/app/presenters/views";

const props = defineProps<{ active: SectionId }>();
const emit = defineEmits<{
  (e: "changed", section: SectionId): void;
}>();

const manager = useStateManager();

const { t } = useI18n();
const active = ref(props.active);

const all = allSectionViews(manager.state);

// the tabs consist of all sections that have no parents and are unlocked
const items = filterArrayView(all, (s) => !s.parentId && s.unlocked);

function onTabClick(id: SectionId) {
  active.value = id;
  emit("changed", id);
}
</script>
<template>
  <ul class="nav nav-pills">
    <li class="nav-item" v-for="section in items" :key="section.id">
      <button class="btn nav-link" :class="{
        active: section.id === active,
        disabled: items.length < 2,
      }" @click="onTabClick(section.id)">
        <slot>
          {{ t(section.title) }}
          <span v-if="section.alert" class="number-annotation bg-danger">{{ section.alert }}</span>
        </slot>
      </button>
    </li>
  </ul>
</template>
