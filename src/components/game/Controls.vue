<template>
  <div class="d-flex flex-column controls">
    <section class="row">
      <os-button
        v-for="item in items.values()"
        :key="item.id"
        :disabled="!item.fulfilled"
        @click="buildItem(item.id)"
      >
        <template #default
          >{{ t(item.label) }}
          <span v-if="item.level > 0">({{ item.level }})</span>
        </template>
        <template #tooltip>
          <div>
            <div class="card-header">
              <p class="description">{{ t(item.description) }}</p>
              <p class="flavor" v-if="item.flavor">
                {{ t(item.flavor) }}
              </p>
            </div>
            <ul class="ingredients-list" v-if="item.ingredients.length > 0">
              <li
                v-for="ingredient in item.ingredients"
                :key="ingredient.resourceId"
                :class="{ unfulfilled: !ingredient.fulfilled }"
              >
                <div class="ingredient-label">
                  {{ t(ingredient.label) }}
                </div>
                <div class="ingredient-fulfillment">
                  <span v-if="!ingredient.fulfilled"
                    >{{ n(ingredient.fulfillment) }} /
                  </span>
                  {{ n(ingredient.requirement) }}
                </div>
              </li>
            </ul>
          </div>
          <div v-if="item.effects.length > 0">
            <div class="card-header">
              {{ t("effects.title.per-level.label") }}
            </div>
            <ul class="effects-list">
              <li v-for="effect in item.effects" :key="effect.resourceId">
                {{ t(effect.label) }}: {{ n(effect.change, true) }}/t
              </li>
            </ul>
          </div>
        </template>
      </os-button>
    </section>
  </div>
</template>

<script lang="ts">
import { BonfireItemId } from "@/app/core/metadata/bonfire";
import { Presenter, Interactor } from "@/app/os";
const notation = Presenter.numbers;

import { computed, defineComponent, unref } from "vue";
import { useI18n } from "vue-i18n";

import Button from "../global/Button.vue";
export default defineComponent({
  components: { "os-button": Button },
  setup() {
    const { t } = { ...useI18n() };
    const items = unref(Presenter.bonfire.items);
    const unlocked = computed(() => items.filter((i) => i.unlocked));
    const n = (v: number, signed = false) => notation.display(v, 3, signed);
    return { t, n, items: unlocked };
  },
  methods: {
    buildItem(id: BonfireItemId) {
      Interactor.bonfire.buildItem(id);
    },
  },
});
</script>