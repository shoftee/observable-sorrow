<template>
  <tippy>
    <button
      type="button"
      class="btn btn-outline-secondary w-100"
      :class="{ disabled }"
      @click="clicked()"
    >
      <slot></slot>
    </button>
    <template #content>
      <slot name="tooltip"></slot>
    </template>
  </tippy>
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
  emits: ["click"],
  methods: {
    clicked() {
      if (!this.disabled) {
        this.$emit("click");
      }
    },
  },
});
</script>