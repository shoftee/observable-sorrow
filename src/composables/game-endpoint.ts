import { inject, InjectionKey, Ref } from "vue";

import { Endpoint } from "@/app/endpoint";
import { IStateManager, NumberFormatter } from "@/app/presenters";
import { Intent } from "@/app/interfaces";

export const EndpointKey: InjectionKey<Ref<Endpoint>> = Symbol("GameEndpoint");

export function useEndpoint<T>(fn: (endpoint: Endpoint) => T): T {
  return fn(ensureEndpoint());
}

export function useSend(): (intent: Intent) => Promise<void> {
  return ensureEndpoint().send;
}

export function useFormatter(): NumberFormatter {
  return ensureEndpoint().presenters.formatter;
}

export function useStateManager(): IStateManager {
  return ensureEndpoint().stateManager;
}

function ensureEndpoint(): Endpoint {
  const ep = inject(EndpointKey);
  if (ep === undefined) {
    throw new Error("could not inject endpoint");
  }
  return ep.value;
}
