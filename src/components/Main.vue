<script setup lang="ts">
import Resources from "./Resources.vue";
import Controls from "./Controls.vue";
import Environment from "./Environment.vue";
import History from "./History.vue";
</script> 

<template>
  <div class="main-container d-flex flex-row scrollable">
    <div class="scrollable col p-2 pe-1">
      <div>
        <Resources />
      </div>
    </div>
    <div class="scrollable col-5 py-2 px-1">
      <div>
        <Controls />
      </div>
    </div>
    <div class="scrollable col p-2 ps-1 d-flex flex-column gap-2">
      <div>
        <Environment />
      </div>
      <div class="scrollable">
        <History />
      </div>
    </div>
  </div>
</template>
