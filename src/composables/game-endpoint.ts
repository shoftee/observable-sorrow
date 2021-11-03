import { inject, InjectionKey, Ref } from "vue";

import { Endpoint } from "@/app/endpoint";

export const EndpointKey: InjectionKey<Ref<Endpoint>> = Symbol("GameEndpoint");

export function endpoint(): Endpoint {
  const ep = inject(EndpointKey);
  if (ep === undefined) {
    throw new Error("Could not inject endpoint, maybe you didn't set it up?");
  }

  return ep.value;
}

export function withEndpoint<T>(fn: (endpoint: Endpoint) => T): T {
  return fn(endpoint());
}
