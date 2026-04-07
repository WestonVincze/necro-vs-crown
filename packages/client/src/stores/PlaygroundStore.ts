import { writable } from "svelte/store";

type UIButton = {
  label: string;
  action: (pos?: { x: number; y: number }) => void;
};

export const buttons = writable<UIButton[]>([]);
