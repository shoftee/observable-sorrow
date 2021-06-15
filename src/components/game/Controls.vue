<template>
  <div>
    <section class="d-flex align-items-center justify-content-center">
      <div class="">
        <button
          type="button"
          class="btn btn-primary"
          :class="{ disabled: catnip.amount == catnip.capacity }"
          @click="gather()"
        >
          Gather catnip
        </button>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import Instance from "@/app/game";
import { Resource } from "@/app/resource";
import { defineComponent, unref } from "vue";
export default defineComponent({
  computed: {
    catnip(): Resource {
      let catnip = Instance.reactive().resources().get("catnip");
      return unref(catnip);
    },
  },
  methods: {
    gather() {
      let catnip = Instance.reactive().resources().get("catnip");
      unref(catnip).amount++;
    },
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.card {
  width: 160px;
}
</style>
