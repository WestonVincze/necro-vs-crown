import { type Types } from "phaser";
import { defineQuery, defineSystem } from "bitecs";
import { Input, Player } from "../components";

export const createInputHandlerSystem = (cursors: Types.Input.Keyboard.CursorKeys) => {
  const inputQuery = defineQuery([Input, Player]);

  return defineSystem(world => {
    const entities = inputQuery(world);

    for (let i in entities) {
      const eid = entities[i];

      if (cursors.left.isDown) {
        Input.moveX[eid] = -1;
      } else if (cursors.right.isDown) {
        Input.moveX[eid] = 1;
      } else {
        Input.moveX[eid] = 0;
      }

      if (cursors.up.isDown) {
        Input.moveY[eid] = -1;
      } else if (cursors.down.isDown) {
        Input.moveY[eid] = 1;
      } else {
        Input.moveY[eid] = 0;
      }
    }

    return world;
  });
}
