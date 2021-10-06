import { computed, ComputedRef } from "vue";

import { Presenters } from "@/app/os";
import {
  BonfireItem,
  Calendar,
  NumberFormatter,
  ResourceItem,
} from "@/app/presenters";

export function getUnlockedResources(): ComputedRef<ResourceItem[]> {
  return computed(() => {
    return Presenters.resources.all.value.filter((m) => m.unlocked);
  });
}

export function getUnlockedBonfireItems(): ComputedRef<BonfireItem[]> {
  return computed(() => Presenters.bonfire.all.value.filter((b) => b.unlocked));
}

export function getCalendar(): ComputedRef<Calendar> {
  return Presenters.environment.calendar;
}

export function useFormatter(): NumberFormatter {
  return Presenters.formatter;
}
