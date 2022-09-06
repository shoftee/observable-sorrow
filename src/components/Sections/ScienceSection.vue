<script setup lang="ts">
import { computed, unref } from "vue";
import { useI18n } from "vue-i18n";

import TechnologyButton from "@/components/Controls/Technology/TechnologyButton.vue";

import { useEndpoint } from "@/composables/game-endpoint";
const { science } = useEndpoint((ep) => {
  return {
    science: ep.presenters.science,
  };
});

const { t } = useI18n();

const techs = computed(() =>
  unref(science.items).filter((item) => item.unlocked),
);
</script>

<template>
  <div class="card">
    <div class="card-header">{{ t("tech.section.title") }}</div>
    <div class="card-body">
      <div class="button-stack">
        <div class="row" v-for="tech in techs" :key="tech.id">
          <div class="col-xl-6 col-12">
            <TechnologyButton :tech="tech" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
