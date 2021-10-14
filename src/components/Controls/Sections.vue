<script setup lang="ts">
import { ref } from 'vue';
import { SectionId, SectionItem } from '@/app/presenters';

const props = defineProps<{
  sections: SectionItem[],
  active: SectionId
}>();

const emit = defineEmits<{
  (e: "changed", section: SectionItem): void,
}>();

const active = ref(props.active);

function onTabClick(section: SectionItem) {
  active.value = section.id
  emit("changed", section);
}

defineExpose({ active });
</script>
<template>
  <ul class="nav nav-pills">
    <li class="nav-item" v-for="section in sections" :key="section.id">
      <button
        class="btn nav-link"
        :class="{
          active: section.id === active,
          disabled: sections.length < 2
        }"
        @click="onTabClick(section)"
      >
        <slot :section="section"></slot>
      </button>
    </li>
  </ul>
</template>