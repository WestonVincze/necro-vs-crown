# NECRO VS CROWN

Extension of `Necro Cursor` (a.k.a `Necro`).

[Play Original Necro](https://necro-cursor.vercel.app/)

[View Source](https://github.com/WestonVincze/necro-cursor)

Built with phaser, colyseus, svelte, bitecs, rxjs, and love.

## Packages

### Client - Svelte / Phaser / RxJS

Contains the UI and game frontend.

- handles user input
- listens to server state and renders entities

### Server - Colyseus / RxJS

Contains core gameplay and multiplayer logic.

- creates rooms and connects clients
- listens to client messages (input)
- sends state to clients
- calculates entity interactions

### Shared - TypeScript / RxJS

Contains utilities and types that are used in both client and server.

- shared types
- entity data
- components (like Movement)

## Setting Up

Clone repo & install dependencies

```bash
npm install
```

Once dependencies for each package are installed, start the server.

From the root or within the `server` package:

```bash
npm run start
```

Open a separate terminal and run

```bash
npm run start:client
```

from the client, or navigate to the client package and run

```bash
npm run dev
```

Open a browser (preferably chrome) and navigate to [http://localhost:7373]()
