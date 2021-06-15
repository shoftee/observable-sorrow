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
import { Resource } from "@/app/resource";
import { defineComponent, PropType } from "vue";
export default defineComponent({
  props: {
    item: {
      type: Object as PropType<Resource>,
      required: true,
    },
  },
});
</script>