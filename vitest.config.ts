import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      $components: path.resolve(__dirname, "src/components"),
      $entities: path.resolve(__dirname, "src/entities"),
      $systems: path.resolve(__dirname, "src/systems"),
      $data: path.resolve(__dirname, "src/data"),
      $relations: path.resolve(__dirname, "src/relations"),
      $types: path.resolve(__dirname, "src/types"),
      $helpers: path.resolve(__dirname, "src/helpers"),
      $events: path.resolve(__dirname, "src/events"),
      $managers: path.resolve(__dirname, "src/managers"),
      $constants: path.resolve(__dirname, "src/constants"),
      $stores: path.resolve(__dirname, "src/stores"),
    },
  },
});
