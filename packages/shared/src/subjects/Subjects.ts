import { Subject, buffer } from "rxjs";

export const endOfFrame = new Subject<void>();
// TODO: reject healthChange events that occur after an entity is killed
export const healthChanges = new Subject<{ eid: number, amount: number }>();
export const onDeath = new Subject<{ eid: number }>();

// we don't need to defer Health changes
// export const bufferedHealthChanges = healthChanges.pipe(buffer(endOfFrame));
export const bufferedOnDeath = onDeath.pipe(buffer(endOfFrame));
