import { Subject } from "rxjs";

// TODO: reject healthChange events that occur after an entity is killed
export const healthChanges = new Subject<{ eid: number, amount: number }>();

export const onDeath = new Subject<{ eid: number }>();
