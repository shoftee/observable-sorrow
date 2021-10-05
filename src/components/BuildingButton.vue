
<script lang="ts">
import { defineComponent, PropType } from "vue";
import { useI18n } from "vue-i18n";

import { BonfireItemId } from "@/_interfaces";
import { Interactor } from "@/app/os";
import { BonfireItem } from "@/app/presenters";

import Ingredients from "./Ingredients.vue";
import Effects from "./Effects.vue";

export default defineComponent({
  props: {
    item: Object as PropType<BonfireItem>,
  },
  components: { Ingredients, Effects },
  setup() {
    const { t } = { ...useI18n() };
    return { t };
  },
  methods: {
    async buildItem(id: BonfireItemId) {
      await Interactor.buildItem(id);
    },
  },
});
</script>

<template>
  <tippy>
    <!-- We need a container div because tippy listens to hover events to trigger and buttons don't fire events when disabled.-->
    <div>
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
          v-if="item.ingredients?.length > 0"
          :items="item.ingredients"
        />
        <Effects v-if="item.effects?.length > 0" :items="item.effects" />
      </div>
    </template>
  </tippy>
</template>
