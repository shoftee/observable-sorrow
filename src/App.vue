<template>
  <div class="w-100 h-100 d-flex flex-column">
    <header class="d-flex d-row align-items-center gap-1">
      <div>Observable Sorrow</div>
      <div class="badge bg-success"><i class="bi bi-droplet"></i> &beta;</div>
    </header>
    <os-main class="h-100" />
    <footer class="d-flex flex-row justify-content-end">
      <div>
        Observable Sorrow is a clone of
        <a href="https://kittensgame.com/web/">Kittens Game</a>.
      </div>
    </footer>
  </div>
</template>

<script lang="ts">
import { Runner } from "./app/os";

import { defineComponent } from "vue";

import Main from "./components/Main.vue";
export default defineComponent({
  components: { "os-main": Main },
  mounted() {
    Runner.start();
  },
});
</script>
