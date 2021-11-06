import { inject, InjectionKey, Ref } from "vue";

import { Endpoint } from "@/app/endpoint";

export const EndpointKey: InjectionKey<Ref<Endpoint>> = Symbol("GameEndpoint");

export function useEndpoint<T>(fn: (endpoint: Endpoint) => T): T {
  const ep = inject(EndpointKey);
  if (ep === undefined) {
    throw new Error("could not inject endpoint");
  }

  return fn(ep.value);
}
