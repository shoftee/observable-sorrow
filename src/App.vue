<template>
  <div
    class="
      w-100
      h-100
      d-flex
      flex-column
      align-items-stretch
      justify-content-center
    "
  >
    <header class="p-1 mb-2 bg-light">
      Observable Sorrow <span class="text-muted">(a Kittens Game clone)</span>
    </header>
    <div class="h-100 d-flex flex-row justify-content-between">
      <div class="p-2 d-flex flex-column">Resources</div>
      <os-controls />
      <os-environment />
    </div>
    <footer class="p-1 mt-2 bg-light d-flex flex-row justify-content-end">
      <a href="https://kittensgame.com/web/">Original game here</a>
    </footer>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import Controls from "./components/game/Controls.vue";
import Environment from "./components/game/Environment.vue";

@Options({
  components: {
    "os-controls": Controls,
    "os-environment": Environment,
  },
})
export default class App extends Vue {}
</script>
