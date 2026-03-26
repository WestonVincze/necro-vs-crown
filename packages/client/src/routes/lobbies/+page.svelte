<script lang="ts">
  import { Client, Room, type RoomAvailable } from "@colyseus/sdk";
  import { Faction } from "@necro-crown/shared";
  import { onMount } from "svelte";
 
  const client = new Client("http://localhost:2567");
  let lobby: Room
  let allRooms: RoomAvailable[] = [];

  onMount(async () => {
    lobby = await client.joinOrCreate("lobby");
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
 
  const handleJoinRoom = async (id: string) => {
    await client.joinById(id, { playerType: Faction.Crown });
  }
</script>

<h1>ROOMS</h1>
{#each allRooms as room}
  <button on:click={() => handleJoinRoom(room.roomId)}>{room.name}</button>
{/each}
