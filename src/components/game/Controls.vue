<script lang="ts">
import { computed, defineComponent, unref, inject } from "vue";
import { useI18n } from "vue-i18n";

import { BonfireItemId } from "@/app/core/metadata";
import { Presenter, Interactor } from "@/app/os";
import { KeyboardEventsKey } from "@/composables/keyboard-events";

import Button from "../global/Button.vue";
export default defineComponent({
  components: { "os-button": Button },
  setup() {
    const events = inject(KeyboardEventsKey);

    const { t } = { ...useI18n() };

    const formatter = Presenter.numbers;
    const res = (v: number) => formatter.number(v, "negative");
    const eff = (v: number) => formatter.number(v, "always");

    const items = unref(Presenter.bonfire.items);
    const unlocked = computed(() => items.filter((i) => i.unlocked));

    return { t, res, eff, items: unlocked, events };
  },
  methods: {
    buildItem(id: BonfireItemId) {
      Interactor.bonfire.buildItem(id);
    },
  },
});
</script>

<template>
  <div class="controls d-flex flex-column">
    <section class="row row-cols-1 row-cols-xl-2 g-2">
      <div class="col" v-for="item in items.values()" :key="item.id">
        <os-button :disabled="!item.fulfilled" @click="buildItem(item.id)">
          <template #default>
            {{ t(item.label) }}
            <span v-if="item.level && item.level > 0" class="structure-level">
              {{ item.level }}
            </span>
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
                  :key="ingredient.id"
                  :class="{ unfulfilled: !ingredient.fulfilled }"
                >
                  <div class="ingredient-label">
                    {{ t(ingredient.label) }}
                  </div>
                  <div class="ingredient-fulfillment number">
                    <span v-if="!ingredient.fulfilled">
                      {{ res(ingredient.fulfillment) }} /
                    </span>
                    {{ res(ingredient.requirement) }}
                  </div>
                </li>
              </ul>
            </div>
            <div v-if="item.effects.length > 0">
              <div class="card-header">
                <template v-if="events.shift">
                  {{ t("building-effects.title.total") }}
                </template>
                <template v-else>
                  {{ t("building-effects.title.per-level") }}
                </template>
              </div>
              <ul class="effects-list">
                <li v-for="effect in item.effects" :key="effect.id">
                  <i18n-t scope="global" :keypath="effect.label" tag="span">
                    <template v-if="effect.perLevelAmount" #amount>
                      <span class="number">
                        <template v-if="events.shift">
                          {{ eff(effect.totalAmount) }}/t
                        </template>
                        <template v-else>
                          {{ eff(effect.perLevelAmount) }}/t
                        </template>
                      </span>
                    </template>
                  </i18n-t>
                </li>
              </ul>
            </div>
          </template>
        </os-button>
      </div>
    </section>
  </div>
</template>
