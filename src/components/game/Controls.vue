<script lang="ts">
import { computed, defineComponent, inject, reactive } from "vue";
import { useI18n } from "vue-i18n";

import { BonfireItemId } from "@/_interfaces";

import { Presenters, Interactor } from "@/app/os";
import { KeyboardEventsKey } from "@/composables/keyboard-events";

import TooltipButton from "../global/TooltipButton.vue";
export default defineComponent({
  components: { TooltipButton },
  setup() {
    const events = inject(KeyboardEventsKey);

    const { t } = { ...useI18n() };

    const formatter = Presenters.numbers;
    const res = (v: number) => formatter.number(v, "negative");
    const eff = (v: number) => formatter.number(v, "always");

    const all = reactive(Presenters.bonfire.all.value);
    const items = computed(() => all.filter((m) => m.unlocked));

    return { t, res, eff, items, events };
  },
  methods: {
    async buildItem(id: BonfireItemId) {
      await Interactor.buildItem(id);
    },
  },
});
</script>

<template>
  <div class="controls d-flex flex-column">
    <section class="row row-cols-1 row-cols-xl-2 g-2">
      <div class="col" v-for="item in items" :key="item.id">
        <TooltipButton :disabled="!item.fulfilled" @click="buildItem(item.id)">
          <template #default>
            {{ t(item.label) }}
            <span v-if="item.level > 0" class="structure-level">
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
              <div v-if="item.ingredients.length > 0">
                <ul class="ingredients-list">
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
                  {{
                    events.shift
                      ? t("building-effects.title.total")
                      : t("building-effects.title.per-level")
                  }}
                </div>
                <ul class="effects-list">
                  <li v-for="effect in item.effects" :key="effect.id">
                    <i18n-t scope="global" :keypath="effect.label" tag="span">
                      <template v-if="effect.perLevelAmount" #amount>
                        <span class="number">
                          {{
                            events.shift
                              ? eff(effect.totalAmount)
                              : eff(effect.perLevelAmount)
                          }}/t
                        </span>
                      </template>
                    </i18n-t>
                  </li>
                </ul>
              </div>
            </div>
          </template>
        </TooltipButton>
      </div>
    </section>
  </div>
</template>
