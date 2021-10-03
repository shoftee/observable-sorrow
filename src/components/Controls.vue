<script lang="ts">
import { computed, defineComponent, inject, reactive } from "vue";
import { useI18n } from "vue-i18n";

import { BonfireItemId } from "@/_interfaces";

import { Presenters, Interactor } from "@/app/os";
import { KeyboardEventsKey } from "@/composables/keyboard-events";

import Ingredients from "./Ingredients.vue";
import Effects from "./Effects.vue";

export default defineComponent({
  components: { Ingredients, Effects },
  setup() {
    const { t } = { ...useI18n() };
    const events = inject(KeyboardEventsKey);

    const formatter = Presenters.formatter;
    const eff = (v: number) => formatter.number(v, "always");

    const all = reactive(Presenters.bonfire.all.value);
    const items = computed(() => all.filter((m) => m.unlocked));

    return { t, events, eff, items };
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
        <tippy>
          <div>
            <!-- We need a container div because tippy listens to hover events to trigger and buttons don't fire events when disabled.-->
            <button
              type="button"
              class="btn btn-outline-secondary w-100"
              :class="{ capped: item.capped }"
              :disabled="!item.fulfilled"
              @click="buildItem(item.id)"
            >
              {{ t(item.label) }}
              <span v-if="item.level > 0" class="structure-level">
                {{ item.level }}
              </span>
            </button>
          </div>

          <template #content>
            <div>
              <div class="card-header">
                <p class="description">{{ t(item.description) }}</p>
                <p class="flavor" v-if="item.flavor">
                  {{ t(item.flavor) }}
                </p>
              </div>
              <Ingredients
                v-if="item.ingredients.length > 0"
                :items="item.ingredients"
              />
              <Effects v-if="item.effects.length > 0" :items="item.effects" />
            </div>
          </template>
        </tippy>
      </div>
    </section>
  </div>
</template>
