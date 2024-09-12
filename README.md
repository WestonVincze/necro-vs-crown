# Necro VS Crown

## What is Necro VS Crown?

Necro VS Crown is an ambitious multiplayer browser game. It was originally a single player POC known as `Necro Cursor`.

You can [play the live demo](https://necro-cursor.vercel.app/) and [view the source code](https://github.com/WestonVincze/necro-cursor).

Necro VS Crown has two distinct factions with opposing goals and distinct mechanics. While playing as the Necro, you control a lowly necromancer and amass an army of skeletons that you control with your mouse. While playing as the Crown, you collect gold over time that can be spent to spawn units that will automatically chase and attack Necro units.

So far, only solo modes are playable. Multiplayer is in the early stages of development but will feature a 1v1 versus mode where each player controls an opposing faction.

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

## Testing

There are unit tests for systems within the shared package, which contains the core of the game logic.

Test suite can be run from the root

```bash
pnpm run test
```

or by navigating to the shared package

```bash
npx vitest
```

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
