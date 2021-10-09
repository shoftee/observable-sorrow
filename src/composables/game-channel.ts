import { Channel, Setup } from "@/app/os";

const channel = Setup();

export async function useGameChannel(): Promise<Channel> {
  return channel;
}

export async function usePresenters(): Promise<Channel["presenters"]> {
  return (await useGameChannel()).presenters;
}

export async function useInteractors(): Promise<Channel["interactors"]> {
  return (await useGameChannel()).interactors;
}
