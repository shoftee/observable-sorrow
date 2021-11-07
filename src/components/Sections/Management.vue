<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { useEndpoint } from "@/composables/game-endpoint";

const { t } = useI18n();

const { society, fmt } = useEndpoint(ep => {
  return {
    society: ep.presenters.society,
    fmt: ep.presenters.formatter,
  }
})

const { happiness } = society;
</script>

<template>
  <div class="card">
    <div class="card-header">{{ t("management.title") }}</div>
    <div class="card-body">
      <div class="row">
        <div v-if="happiness.view.value !== undefined" class="col-xl-6 col-12">
          <div class="text-center p-2">
            <tippy>
              Happiness:
              <span class="ms-1 number">{{ fmt.v(happiness.view) }}</span>
              <template #content>
                <div>
                  <div class="card-header">{{ t("management.happiness.detail.0") }}</div>
                </div>
              </template>
            </tippy>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
