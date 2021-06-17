<template>
  <div class="w-100 h-100 d-flex flex-column">
    <header class="d-flex">
      <div>
        Observable Sorrow
        <span class="badge bg-success text-uppercase"
          ><i class="bi bi-droplet"></i> beta</span
        >
      </div>
    </header>
    <os-main class="h-100" />
    <footer class="d-flex flex-row justify-content-end">
      <div>
        Observable Sorrow is a clone of Kittens Game.
        <a href="https://kittensgame.com/web/">Original game here</a>
      </div>
    </footer>
  </div>
</template>

<script lang="ts">
import Main from "./components/Main.vue";
import Os from "./app/os";

import { defineComponent } from "vue";
export default defineComponent({
  components: { "os-main": Main },
  mounted() {
    Os.start();
  },
});
</script>
