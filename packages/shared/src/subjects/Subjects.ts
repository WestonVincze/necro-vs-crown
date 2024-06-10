import { Subject } from "rxjs";

export const healthChanges = new Subject<{ eid: number, amount: number }>();

export const onDeath = new Subject<{ eid: number }>();
