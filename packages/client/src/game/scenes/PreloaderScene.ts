import { Loader, Scene } from "phaser";
import { assets } from "../../stores/AssetStore";
import { SpriteTexture } from "@necro-crown/shared";

export class PreloaderScene extends Scene {
  private gameMode: string = "solo";

  constructor() {
    super({ key: "PreloaderScene" });
  }

  init(data: { gameMode: "solo" | "versus" | "playground" }) {
    this.gameMode = data.gameMode;
  }

  preload() {
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2;

    // --- Layout ---
    const barWidth = 320;
    const barHeight = 4;
    const barX = cx - barWidth / 2;
    const barY = cy + 24;

    // Track background
    this.add
      .rectangle(cx, barY, barWidth, barHeight, 0x2a2820)
      .setOrigin(0.5, 0.5);

    // Fill bar — starts at zero width
    const fill = this.add
      .rectangle(barX, barY, 0, barHeight, 0xb8963e)
      .setOrigin(0, 0.5);

    // Label
    const label = this.add
      .text(cx, cy - 8, "Loading...", {
        fontFamily: "Barlow, sans-serif",
        fontSize: "13px",
        color: "#6a6558",
      })
      .setOrigin(0.5, 1);

    const percent = this.add
      .text(cx, barY + 16, "0%", {
        fontFamily: "Barlow, sans-serif",
        fontSize: "11px",
        color: "#4a4538",
      })
      .setOrigin(0.5, 0);

    // --- Progress events ---
    this.load.on("progress", (value: number) => {
      fill.width = barWidth * value;
      percent.setText(`${Math.round(value * 100)}%`);
    });

    this.load.on("fileprogress", (file: Loader.File) => {
      label.setText(file.key);
    });

    this.load.on("complete", () => {
      label.setText("Ready");
      percent.setText("100%");
    });

    assets.subscribe((assetUrls) => {
      for (const [key, url] of Object.entries(assetUrls)) {
        this.load.image(
          SpriteTexture[key as keyof typeof SpriteTexture].toString(),
          url,
        );
      }
    });

    // SFX test
    this.load.audio("hurt", "sfx/hurt.wav");
    this.load.audio("miss", "sfx/miss.wav");

    this.load.tilemapTiledJSON("map", "tilemaps/doodle_map.json");
    this.load.image("doodle", "tilemaps/Doodle.png");
  }

  create() {
    console.log(this.gameMode);
    switch (this.gameMode) {
      case "solo":
        this.scene.start("MainMenu");
        break;
      case "versus":
        this.scene.start("VersusModeScene");
        break;
      case "playground":
        this.scene.start("PlaygroundScene");
        break;
    }
  }
}
/*

export class PreloaderScene extends Scene {
  constructor() {
    super("Preloader");
  }

  preload() {
    assets.subscribe((assetUrls) => {
      for (const [key, url] of Object.entries(assetUrls)) {
        this.load.image(
          SpriteTexture[key as keyof typeof SpriteTexture].toString(),
          url,
        );
      }
    });

    this.load.tilemapTiledJSON("map", "tilemaps/sampleLevel.json");
    this.load.image("sample", "tilemaps/sample.png");
  }

  create() {
    this.scene.start("MainMenu");
  }
}

*/
