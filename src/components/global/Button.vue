<template>
  <div class="col-6">
    <tippy>
      <button
        type="button"
        class="btn btn-light w-100"
        :class="{ disabled }"
        v-bind="$attrs"
      >
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