import { Subject, buffer, distinct, filter, map, scan } from "rxjs";

export const endOfFrame = new Subject<void>();
// TODO: reject healthChange events that occur after an entity is killed
export const healthChanges = new Subject<{ eid: number, amount: number, isCrit?: boolean }>();
export const onDeath = new Subject<{ eid: number }>();

export const bufferedOnDeath = onDeath.pipe(
  distinct(event => event.eid),
  buffer(endOfFrame),
  filter(events => events.length > 0),
);
