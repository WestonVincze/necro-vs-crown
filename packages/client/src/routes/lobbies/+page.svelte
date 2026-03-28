<script lang="ts">
  import { Client, Room, type RoomAvailable } from "@colyseus/sdk";
  import { onMount } from "svelte";
 
  const client = new Client(import.meta.env.VITE_SERVER_URI);
  let lobby: Room
  let allRooms: RoomAvailable[] = [];

  onMount(async () => {
    lobby = await client.joinOrCreate("lobbies");
    lobby.onMessage("rooms", (rooms) => {
      allRooms = rooms;
    });
    
    lobby.onMessage("+", ([roomId, room]) => {
      const roomIndex = allRooms.findIndex((room) => room.roomId === roomId);
      if (roomIndex !== -1) {
        allRooms[roomIndex] = room;
    
      } else {
        allRooms.push(room);
      }
    });
    
    lobby.onMessage("-", (roomId) => {
      allRooms = allRooms.filter((room) => room.roomId !== roomId);
    });
  })
</script>

<div class="lobbies">
  <h1>Browse Open Lobbies</h1>
  <div class="rooms">
    {#each allRooms as room}
      <div class="room">
        <h2>Room ID: {room.roomId}</h2>
        <p>Players: {room.clients} / {room.maxClients}</p>
        <a href="/lobby?roomId={room.roomId}">Join Lobby</a>
      </div>
    {/each}
  </div>
</div>

<style>
  .lobbies {
    padding-top: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  .rooms {
    display: flex;
    gap: 18px;
  }
  .room {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    background-color: var(--bg-secondary);
    border-radius: 5px;;
    text-align: center;
  }
  a {
    color: var(--crown);
  }
</style>