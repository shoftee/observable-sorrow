import { inject, InjectionKey, Ref } from "vue";

import { Channel } from "@/app/channel";

export const ChannelKey: InjectionKey<Ref<Channel>> = Symbol("GameChannel");

export function injectChannel(): Channel {
  const channel = inject(ChannelKey);
  if (!channel?.value) {
    throw new Error("Could not inject channel, maybe you didn't set it up?");
  }

  return channel.value;
}
