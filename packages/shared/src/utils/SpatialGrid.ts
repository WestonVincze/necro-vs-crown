import { World } from 'bitecs';
import { Position } from '../components';

/**
 ** NOT YET REQUIRED, USED, OR TESTED **
 ***************************************
 * SpatialGrid is a performance optimization intended to split entities into smaller batches based on their position. 
 * 
 * `cellSize` defines the length and width of a cell within the grid
 * `grid` is a map of cells that contains a Set of entity ID's
 * 
 * SpatialGrid should only be used if the calculation complexity of entities exceeds the 16ms limit
 * * do not prematurely integrate if 144fps can be maintained with ~800 entities 
 */

export class SpatialGrid {
  private cellSize: number;
  private grid: Map<string, Set<number>>;

  constructor(cellSize: number) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  private getCellKey(x: number, y: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }

  insert(world: World, eid: number): void {
    const x = Position.x[eid];
    const y = Position.y[eid];
    const key = this.getCellKey(x, y);
    if (!this.grid.has(key)) {
      this.grid.set(key, new Set());
    }
    this.grid.get(key)!.add(eid);
  }

  query(x: number, y: number, range: number): Set<number> {
    const nearbyEntities = new Set<number>();
    const minX = Math.floor((x - range) / this.cellSize);
    const maxX = Math.floor((x + range) / this.cellSize);
    const minY = Math.floor((y - range) / this.cellSize);
    const maxY = Math.floor((y + range) / this.cellSize);

    for (let cx = minX; cx <= maxX; cx++) {
      for (let cy = minY; cy <= maxY; cy++) {
        const key = `${cx},${cy}`;
        if (this.grid.has(key)) {
          for (let eid of this.grid.get(key)!) {
            nearbyEntities.add(eid);
          }
        }
      }
    }

    return nearbyEntities;
  }

  clear(): void {
    this.grid.clear();
  }
}
