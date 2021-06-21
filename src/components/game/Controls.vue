<template>
  <div class="d-flex flex-column controls">
    <section class="row">
      <os-button
        v-for="item in items.values()"
        :key="item.id"
        :disabled="!item.fulfilled"
        @click="buildItem(item.id)"
      >
        <template #default>{{ t(item.label) }}</template>
        <template #tooltip>
          <div class="card-header">
            {{ t(item.description) }}
          </div>
          <ul
            v-if="item.ingredients.length > 0"
            class="list-group list-group-flush"
          >
            <li
              v-for="ingredient in item.ingredients"
              :key="ingredient.id"
              class="list-group-item clearfix"
              :class="{ 'text-danger': !ingredient.fulfilled }"
            >
              <div class="float-start">
                {{ t(ingredient.label) }}
              </div>
              <div class="float-end">
                <span v-if="!ingredient.fulfilled"
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
import { BonfireItemId } from "@/app/bonfire/metadata";
import { Presenter, Interactor } from "@/app/os";

import { defineComponent, unref } from "vue";
import { useI18n } from "vue-i18n";

import Button from "../global/Button.vue";
export default defineComponent({
  components: { "os-button": Button },
  setup() {
    const { t } = { ...useI18n() };
    const items = unref(Presenter.bonfire.items);
    return { t, items };
  },
  methods: {
    buildItem(id: BonfireItemId) {
      Interactor.bonfire.buildRecipe(id);
    },
  },
});
</script>