<template>
  <main class="d-flex flex-row shrinkable">
    <div class="shrinkable col-3 p-2">
      <div class="d-flex flex-column">
        <os-resources />
      </div>
    </div>
    <div class="shrinkable col-6 p-2">
      <os-controls />
    </div>
    <div class="shrinkable col-3 p-2">
      <os-environment />
    </div>
  </main>
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