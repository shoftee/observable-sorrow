<template>
  <div class="main-container d-flex flex-row scrollable">
    <div class="scrollable col p-2 pe-1">
      <div>
        <os-resources />
      </div>
    </div>
    <div class="scrollable col-5 py-2 px-1">
      <div>
        <os-controls />
      </div>
    </div>
    <div class="scrollable col p-2 ps-1 d-flex flex-column gap-2">
      <div>
        <os-environment />
      </div>
      <div class="scrollable">
        <section class="scrollable scrollable-overflow card p-2">
          You are a kitten in a catnip forest.
        </section>
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