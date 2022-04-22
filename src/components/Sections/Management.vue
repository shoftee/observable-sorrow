<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { useEndpoint } from "@/composables/game-endpoint";

const { t } = useI18n();

const { society, fmt } = useEndpoint((ep) => {
  return {
    society: ep.presenters.society,
    fmt: ep.presenters.formatter,
  };
});

const { happiness } = society;
</script>

<template>
  <div class="card">
    <div class="card-header">{{ t("management.title") }}</div>
    <div class="card-body">
      <div class="row">
        <div class="col-xl-6 col-12">
          <div v-if="happiness.view.value !== undefined" class="text-center p-2">
            <tippy>
              <i18n-t keypath="management.happiness.label" scope="global">
                <template #amount>
                  <span class="ms-1 number">{{ fmt.v(happiness.view) }}</span>
                </template>
              </i18n-t>
              <template #content>
                <div>
                  <div class="card-header">
                    {{ t("management.happiness.detail") }}
                  </div>
                </div>
              </template>
            </tippy>
          </div>
        </div>
        <div class="col-xl-6 col-12">
          <div v-if="true"></div>
        </div>
      </div>
    </div>
  </div>
</template>
