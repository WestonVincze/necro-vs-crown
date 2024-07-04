import { type Unit, type ItemName } from '@necro-crown/shared';
import { writable } from 'svelte/store';

export const assets = writable<Record<Unit | ItemName, string>>({
  Necromancer: 'necro.png',
  Skeleton: 'skele.png',
  Peasant: 'peasant.png',
  Guard: 'guard.png',
  Paladin: 'paladin.png',
  Doppelsoldner: 'doppelsoldner.png',
  Archer: 'archer.png',
  Bones: 'bones.png',
  MedHelm: 'med_helm.png',
  BucketHelm: 'bucket_helm.png',
  GreatSword: 'great_sword.png',
  Crossbow: 'crossbow.png',
  Arrow: 'arrow.png',
});
