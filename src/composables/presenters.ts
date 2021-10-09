import { computed, ComputedRef } from "vue";

import {
  BonfireItem,
  Calendar,
  NumberFormatter,
  ResourceItem,
} from "@/app/presenters";
import { Channel } from "@/app/os";

type Presenters = Channel["presenters"];

export function getResources(p: Presenters): ComputedRef<ResourceItem[]> {
  return computed(() => {
    return p.resources.all.value.filter((m) => m.unlocked);
  });
}

export function getBonfireItems(p: Presenters): ComputedRef<BonfireItem[]> {
  return computed(() => {
    return p.bonfire.all.value.filter((b) => b.unlocked);
  });
}

export function getCalendar(p: Presenters): ComputedRef<Calendar> {
  return p.environment.calendar;
}

export function useFormatter(p: Presenters): NumberFormatter {
  return p.formatter;
}
