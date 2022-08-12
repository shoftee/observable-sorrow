import { inject, InjectionKey, Ref } from "vue";

import { Endpoint } from "@/app/endpoint";
import { IStateManager } from "@/app/presenters";
import { Intent } from "@/app/interfaces";

export const EndpointKey: InjectionKey<Ref<Endpoint>> = Symbol("GameEndpoint");

export function useEndpoint<T>(fn: (endpoint: Endpoint) => T): T {
  const ep = inject(EndpointKey);
  if (ep === undefined) {
    throw new Error("could not inject endpoint");
  }

  return fn(ep.value);
}

export function useSend(): (intent: Intent) => Promise<void> {
  const ep = inject(EndpointKey);
  if (ep === undefined) {
    throw new Error("could not inject endpoint");
  }
  return ep.value.send;
}

export function useStateManager(): IStateManager {
  const ep = inject(EndpointKey);
  if (ep === undefined) {
    throw new Error("could not inject endpoint");
  }
  return ep.value.stateManager;
}
