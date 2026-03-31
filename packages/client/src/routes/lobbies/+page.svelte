<script lang="ts">
  import { Logo } from "$UI/Logo";
  import { Navbar } from "$UI/Navbar";
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
  <Navbar />
  <Logo />
  <h2>Browse Open Lobbies</h2>
  <p>Found active {allRooms.length} {allRooms.length === 1 ? "lobby" : "lobbies"}.</p>
  <div class="rooms">
    {#if allRooms.length === 0}
      <div class="room">
        <a href="/lobby">Create New Lobby</a>
      </div>
    {/if}
    {#each allRooms as room}
      <div class="room">
        <h3>Lobby Code: {room.roomId}</h3>
        <p>Players: {room.clients} / {room.maxClients}</p>
        <a href="/lobby?roomId={room.roomId}">Join Lobby</a>
      </div>
    {/each}
  </div>
</div>

<style>
  .lobbies {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding-top: var(--nav-padding);
  }
  .rooms {
    display: flex;
    gap: 16px;
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
    pointer-events: all;
    color: var(--crown);
  }
</style>