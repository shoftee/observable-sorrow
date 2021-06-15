<template>
  <div
    class="d-inline-flex align-items-center align-items-stretch resource-item"
  >
    <div class="name">
      {{ item.id }}
      <!-- <span class="bg-danger badge badge-light">!</span> -->
    </div>
    <div class="mx-1 amount">{{ item.amount }}</div>
    <div class="slash">/</div>
    <div class="mx-1 capacity">{{ item.capacity }}</div>
    <div class="change">+7.777 QWWT/s</div>
  </div>
</template>

<script lang="ts">
import { State as ResourceState } from "@/app/resources/state";
import { defineComponent, PropType } from "vue";
export default defineComponent({
  props: {
    item: {
      type: Object as PropType<ResourceState>,
      required: true,
    },
  },
});
</script>