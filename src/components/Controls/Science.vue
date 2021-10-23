<script setup lang="ts">
import { unref } from "vue";
import { useI18n } from "vue-i18n";

import TechnologyButton from "./TechnologyButton.vue";

import { injectChannel } from "@/composables/game-channel";
const { science } = injectChannel().presenters;

const { t } = useI18n();

const technologies = unref(science.items);
</script>

<template>
  <div class="card">
    <div class="card-header">{{ t("technology.section.title") }}</div>
    <div class="card-body">
      <div class="button-stack">
        <div class="row" v-for="tech in technologies" :key="tech.id">
          <div class="col-xl-6 col-12">
            <TechnologyButton :tech="tech" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>