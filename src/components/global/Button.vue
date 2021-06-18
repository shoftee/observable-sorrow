<template>
  <div class="btn-container">
    <tippy>
      <button type="button" :class="{ disabled }" v-bind="$attrs">
        <slot></slot>
      </button>
      <template #content>
        <slot name="tooltip"></slot>
      </template>
    </tippy>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  inheritAttrs: false,
});
</script>