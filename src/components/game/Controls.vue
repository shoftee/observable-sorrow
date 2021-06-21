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
      <os-button :disabled="!recipe.fulfilled" @click="refineCatnip()">
        <template #default>{{ t("bonfire.refine-catnip.title") }}</template>
        <template #tooltip>
          <div class="card-header">{{ t("bonfire.refine-catnip.desc") }}</div>
          <ul class="list-group list-group-flush">
            <li
              v-for="ingredient in recipe.ingredients"
              :key="ingredient.id"
              class="list-group-item clearfix"
              :class="{ 'text-danger': !ingredient.fulfilled }"
            >
              <div class="float-start">
                {{ t("resources." + ingredient.id + ".title") }}
              </div>
              <div class="float-end">
                <span v-show="!ingredient.fulfilled"
                  >{{ ingredient.fulfillment }} /
                </span>
                {{ ingredient.requirement }}
              </div>
            </li>
          </ul>
        </template>
      </os-button>
    </section>
  </div>
</template>

<script lang="ts">
import { Presenter, Interactor } from "@/app/os";
const presenter = Presenter.workshop;
const interactor = Interactor.workshop;

import { defineComponent, unref } from "vue";
import { useI18n } from "vue-i18n";

import Button from "../global/Button.vue";
export default defineComponent({
  components: { "os-button": Button },
  setup() {
    const { t } = { ...useI18n() };
    const recipe = unref(presenter.recipes).get("refine-catnip");
    return { t, recipe };
  },
  methods: {
    gatherCatnip() {
      interactor.gatherCatnip();
    },
    refineCatnip() {
      interactor.refineCatnip();
    },
  },
});
</script>