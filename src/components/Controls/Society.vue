<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import JobButton from './JobButton.vue';

import { count } from '@/_utils/collections';
import { injectChannel } from '@/composables/game-channel';

const { society } = injectChannel().presenters;
const { t } = useI18n();

const jobs = computed(() => society.jobs);
const totalPops = computed(() => society.pops.values.length);
const unemployedPops = computed(() => count(society.pops.values, item => item.job === undefined))
const noUnemployment = computed(() => unemployedPops.value === 0)
</script>

<template>
  <div class="card">
    <template v-if="totalPops === 0">
      <div class="card-body text-center">{{ t("jobs.status.empty") }}</div>
    </template>
    <template v-else>
      <div class="card-header">{{ t("jobs.title") }}</div>
      <div class="card-body">
        <div>
          <p v-if="noUnemployment">{{ t("jobs.status.good") }}</p>
          <p v-else>
            <span>{{ t("jobs.status.idle", { idle: unemployedPops }, unemployedPops) }}</span>
          </p>
        </div>
        <div class="col-xl-6 col-12" v-for="job in jobs.values()" :key="job.id">
          <JobButton :item="job" :noUnemployment="noUnemployment" />
        </div>
      </div>
    </template>
  </div>
</template>