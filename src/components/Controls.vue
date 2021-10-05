<script lang="ts">
import { computed, defineComponent, reactive } from "vue";

import { Presenters } from "@/app/os";

import BuildingButton from "./BuildingButton.vue";

export default defineComponent({
  components: { BuildingButton },
  setup() {
    const all = reactive(Presenters.bonfire.all.value);
    const items = computed(() => all.filter((m) => m.unlocked));
    return { items };
  },
});
</script>

<template>
  <div class="controls d-flex flex-column">
    <section class="row row-cols-1 row-cols-xl-2 g-2">
      <div class="col" v-for="item in items" :key="item.id">
        <BuildingButton :item="item" />
      </div>
    </section>
  </div>
</template>
