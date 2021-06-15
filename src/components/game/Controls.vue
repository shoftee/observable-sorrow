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
import { defineComponent } from "vue";
export default defineComponent({
  setup() {
    return {
      catnip: Instance.reactive().resources().get("catnip"),
    };
  },
  methods: {
    gather() {
      this.catnip.amount++;
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
