<template>
  <div>
    <section>
      <div class="d-flex flex-column align-items-stretch">
        <div class="p-2">
          Game tick <span>{{ tick }}</span>
        </div>
        <div class="p-2">
          Day <span>{{ day }}</span>
        </div>
        <div class="p-2 align-self-stretch">History</div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import Game from "@/app/game";

import { from } from "rxjs";

import { defineComponent } from "vue";
export default defineComponent({
  subscriptions() {
    return {
      day: from(Game.observer.days()),
      tick: from(Game.observer.ticks()),
    };
  },
});
</script>
