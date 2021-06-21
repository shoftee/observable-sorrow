<template>
  <div class="d-flex flex-column controls">
    <section class="row">
      <os-button @click="gatherCatnip()">
        <template #default>{{ t("bonfire.gather-catnip.title") }}</template>
        <template #tooltip>
          <div class="card-header">
            {{ t("bonfire.gather-catnip.desc") }}
          </div>
        </template>
      </os-button>
      <os-button :disabled="true" @click="refineCatnip()">
        <template #default>{{ t("bonfire.refine-catnip.title") }}</template>
        <template #tooltip>
          <div class="card-header">{{ t("bonfire.refine-catnip.desc") }}</div>
          <ul class="list-group list-group-flush">
            <li class="list-group-item clearfix">
              <div class="float-start">catnip</div>
              <div class="float-end">50</div>
            </li>
          </ul>
        </template>
      </os-button>
    </section>
  </div>
</template>

<script lang="ts">
import Button from "../global/Button.vue";

import { defineComponent } from "vue";
import { useI18n } from "vue-i18n";
import Presenter from "@/app/os";
export default defineComponent({
  components: { "os-button": Button },
  setup() {
    const { t } = { ...useI18n() };
    return { t };
  },
  methods: {
    gatherCatnip() {
      Presenter.workshop.gatherCatnip();
      Presenter.forceUpdate();
    },
    refineCatnip() {
      Presenter.workshop.refineCatnip();
      Presenter.forceUpdate();
    },
  },
});
</script>