<template>
  <div class="main-container d-flex flex-row shrinkable">
    <div class="shrinkable col p-2">
      <div>
        <os-resources />
      </div>
    </div>
    <div class="shrinkable col-5 p-2">
      <div>
        <os-controls />
      </div>
    </div>
    <div class="d-flex flex-column shrinkable col p-2">
      <div class="mb-2">
        <os-environment />
      </div>
      <div class="shrinkable">
        <div class="p-2">You are a kitten in a catnip forest.</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Resources from "./game/Resources.vue";
import Controls from "./game/Controls.vue";
import Environment from "./game/Environment.vue";

import { defineComponent } from "vue";
export default defineComponent({
  components: {
    "os-resources": Resources,
    "os-controls": Controls,
    "os-environment": Environment,
  },
});
</script> 