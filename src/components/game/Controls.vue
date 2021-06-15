<template>
  <div class="w-100 d-flex align-items-center justify-content-center">
    <div class="">
      <button type="button" class="btn btn-primary" @click="gather">
        Gather catnip
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
export default class Controls extends Vue {
  gather(): void {
    this.$emit("gather");
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.card {
  width: 160px;
}
</style>
