<template>
  <div class="btn-container">
    <button type="button" v-bind="$attrs">
      <slot></slot>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  inheritAttrs: false,
});
</script>