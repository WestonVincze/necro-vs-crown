import { defineQuery } from "bitecs";
import { Input, Player } from "../components";
// TODO: move InputHandlerSystem to client, it won't be shared
import { createActiveActions, type InputAction, type action } from "../../../client/src/input";

const inputMap: InputAction = {
  moveLeft: ["a"],
  moveRight: ["d"],
  moveUp: ["w"],
  moveDown: ["s"],
  castSpell: [" "],
}

export const createInputHandlerSystem = () => {
  const activeActions$ = createActiveActions(inputMap);
  // TODO: reset active keys on focus out
  let activeKeys: Partial<Record<action, boolean>> = {};
  activeActions$.subscribe(activeActions => activeKeys = activeActions);

  const inputQuery = defineQuery([Input, Player]);

  return (world: World) => {
    const entities = inputQuery(world);

    for (let i in entities) {
      const eid = entities[i];

      if (activeKeys.castSpell) {
        Input.castingSpell[eid] = 1;
        // TODO: introduce a way to effect movement without modifying the input directly
        Input.moveX[eid] = 0;
        Input.moveY[eid] = 0;
        continue;
      } else {
        Input.castingSpell[eid] = 0;
      }

      if (activeKeys.moveLeft) {
        Input.moveX[eid] = -1;
      } else if (activeKeys.moveRight) {
        Input.moveX[eid] = 1;
      } else {
        Input.moveX[eid] = 0;
      }

      if (activeKeys.moveUp) {
        Input.moveY[eid] = -1;
      } else if (activeKeys.moveDown) {
        Input.moveY[eid] = 1;
      } else {
        Input.moveY[eid] = 0;
      }
    }

    return world;
  }
}
