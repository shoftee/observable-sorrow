import { computed, ComputedRef, unref } from "vue";

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
    return unref(p.resources.all).filter((r) => r.unlocked);
  });
}

export function getBonfireItems(p: Presenters): ComputedRef<BonfireItem[]> {
  return computed(() => {
    return unref(p.bonfire.all).filter((b) => b.unlocked);
  });
}

export function getCalendar(p: Presenters): Calendar {
  return unref(p.environment.calendar);
}

export function useFormatter(p: Presenters): NumberFormatter {
  return p.formatter;
}
