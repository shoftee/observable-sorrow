<template>
  <div class="w-100 h-100 d-flex flex-column">
    <header class="px-2 y-1 d-flex bg-light">
      Observable Sorrow - a Kittens Game clone
    </header>
    <os-main class="h-100" />
    <footer class="px-2 py-1 bg-light d-flex flex-row justify-content-end">
      <a href="https://kittensgame.com/web/">Original game here</a>
    </footer>
  </div>
</template>

<script lang="ts">
import Main from "./components/Main.vue";

import { defineComponent } from "vue";
export default defineComponent({
  components: { "os-main": Main },
});
</script>
