<template>
  <div
    class="d-inline-flex align-items-center align-items-stretch resource-item"
  >
    <div class="name">
      <span>{{ t(title) }}</span>
      <!-- <span class="badge bg-danger badge-light">!</span> -->
    </div>
    <div class="mx-1 amount">{{ item.amount }}</div>
    <template v-if="item.capacity != undefined">
      <div class="slash">/</div>
      <div class="mx-1 capacity">{{ item.capacity }}</div>
    </template>
    <template v-else>
      <div class="no-capacity"></div>
    </template>
    <div class="change"></div>
  </div>
</template>

<script lang="ts">
import { IResourceState as IState } from "@/app/components/resource";
import { ResourceMetadata } from "@/app/resources/metadata";
import { defineComponent, PropType } from "vue";
import { useI18n } from "vue-i18n";
export default defineComponent({
  props: {
    item: {
      type: Object as PropType<IState>,
      required: true,
    },
  },
  setup(props) {
    const resourceTitle = ResourceMetadata[props.item.id].title;
    const { t } = { ...useI18n() };
    return { t, title: resourceTitle };
  },
});
</script>