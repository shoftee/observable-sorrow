<template>
  <div class="d-flex flex-column align-items-stretch">
    <div class="p-2">History</div>
    <div class="p-2 align-self-stretch">
      Game tick <span>{{ tick }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { from } from "rxjs";

import Game from "@/app/game";

export default defineComponent({
  subscriptions() {
    return {
      tick: from(Game.observer.ticks()),
    };
  },
});
</script>
