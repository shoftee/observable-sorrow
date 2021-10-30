<script setup lang="ts">
import { computed, unref } from "vue";
import { useI18n } from "vue-i18n";

import JobButton from "./Job/Button.vue";

import { count } from "@/app/utils/collections";
import { injectChannel } from "@/composables/game-channel";

const { society } = injectChannel().presenters;
const { t } = useI18n();

const jobs = computed(() => unref(society.jobs).filter(item => item.unlocked));
const totalPops = computed(() => society.pops.values.length);
const idle = computed(() => count(society.pops.values, item => item.job === undefined))
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
          <p v-if="idle === 0">{{ t("jobs.status.good") }}</p>
          <p v-else>
            <span>{{ t("jobs.status.idle", { idle }, idle) }}</span>
          </p>
        </div>
        <div class="button-stack">
          <div class="row" v-for="job in jobs" :key="job.id">
            <div class="col-xl-6 col-12">
              <JobButton :item="job" :noIdle="idle === 0" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>