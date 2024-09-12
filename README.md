# Necro VS Crown

This project is a complete rebuild and extension of a POC project `Necro Cursor`.

[Play Necro Cursor](https://necro-cursor.vercel.app/)

[View Source Code](https://github.com/WestonVincze/necro-cursor)

## Installation Instructions

Clone repo & install dependencies

```bash
pnpm install
```

Start single player client

```bash
pnpm run dev
```

Open a browser and navigate to [http://localhost:7373]()

## Project Information

Built with phaser, colyseus, svelte, bitecs, rxjs, and love.

[bitECS](https://github.com/NateTheGreatt/bitECS) - ECS library

[Phaser](https://phaser.io/) - WebGL rendering engine

[Colyseus](https://colyseus.io/) - websocket based multiplayer

[Svelte](https://svelte.dev/) - UI and menus

[RxJS](https://rxjs.dev/) - event management

## Monorepo Packages

### Shared

Contains the core of the game written in bitECS and other resources used in both client and server.

- entity blueprints (prefabs)
- component data
- system logic and pipelines
- unit tests for systems
- shared types

### Client

- UI and menus
- contains game scenes and local state
- sends requests to server
- listens to server state updates
- renders game state

### Server

- creates rooms and connects clients
- listens to client messages (input)
- sends state to clients
- calculates entity interactions
