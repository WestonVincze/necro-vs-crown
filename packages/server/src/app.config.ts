import {
  defineServer,
  defineRoom,
  monitor,
  playground,
  LobbyRoom,
} from "colyseus";

/**
 * Import your Room files
 */
import { MyRoom } from "./rooms/MyRoom";
import { GameLobby } from "./rooms/Lobby";

const server = defineServer({
  rooms: {
    my_room: defineRoom(MyRoom),
    lobby: defineRoom(GameLobby).enableRealtimeListing(),
    lobbies: defineRoom(LobbyRoom),
  },

  express: (app) => {
    app.get("/hello", (req, res) => {
      res.send("It's time to kick ass and chew bubblegum!");
    });

    /**
     * Use @colyseus/monitor
     * It is recommended to protect this route with a password
     * Read more: https://docs.colyseus.io/tools/monitoring/#restrict-access-to-the-panel-using-a-password
     */
    app.use("/monitor", monitor());

    if (process.env.NODE_ENV !== "production") {
      app.use("/", playground);
    }
  },
});

export default server;
