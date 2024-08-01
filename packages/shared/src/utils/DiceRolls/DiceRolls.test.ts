import { describe, it, expect, vi } from "vitest";
import { rollDice, rollToHit, rollToCrit, rollDamage } from "./DiceRolls";

describe("Dice Roll Utility Functions", () => {
  describe("rollDice", () => {
    it("should return a number between 1 and the number of sides inclusive", () => {
      const sides = 6;
      const result = rollDice(sides);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(sides);
    });

    it("should include the bonus in the result", () => {
      const sides = 6;
      const bonus = 2;
      const result = rollDice(sides, bonus);
      expect(result).toBeGreaterThanOrEqual(1 + bonus);
      expect(result).toBeLessThanOrEqual(sides + bonus);
    });

    it("should return the min damage", () => {
      const sides = 10;
      const bonus = 2;
      vi.spyOn(global.Math, "random").mockReturnValue(0);
      let result = rollDice(sides, bonus);
      expect(result).toEqual(1 + bonus);
      vi.restoreAllMocks();
    });

    it("should return the max damage", () => {
      const sides = 10;
      const bonus = 2;
      vi.spyOn(global.Math, "random").mockReturnValue(1);
      let result = rollDice(sides, bonus);
      expect(result).toEqual(sides + bonus);
      vi.restoreAllMocks();
    });
  });

  describe("rollToHit", () => {
    it("should return true if rollDice result is greater than or equal to difficulty", () => {
      vi.spyOn(global.Math, "random").mockReturnValue(0.95);
      const difficulty = 15;
      const result = rollToHit(difficulty);
      expect(result).toBe(true);
      vi.restoreAllMocks();
    });

    it("should return false if rollDice result is less than difficulty", () => {
      vi.spyOn(global.Math, "random").mockReturnValue(0.05);
      const difficulty = 15;
      const result = rollToHit(difficulty);
      expect(result).toBe(false);
      vi.restoreAllMocks();
    });
  });

  describe("rollToCrit", () => {
    it("should return true if rollDice result plus critChance is greater than or equal to 100", () => {
      vi.spyOn(global.Math, "random").mockReturnValue(0.95);
      const critChance = 10;
      const result = rollToCrit(critChance);
      expect(result).toBe(true);
      vi.restoreAllMocks();
    });

    it("should return false if rollDice result plus critChance is less than 100", () => {
      vi.spyOn(global.Math, "random").mockReturnValue(0.05);
      const critChance = 10;
      const result = rollToCrit(critChance);
      expect(result).toBe(false);
      vi.restoreAllMocks();
    });
  });

  describe("rollDamage", () => {
    it("should return maxHit + damageBonus with the highest roll", () => {
      vi.spyOn(global.Math, "random").mockReturnValue(1);
      const maxHit = 6;
      const damageBonus = 5;

      let result = rollDamage(maxHit, damageBonus);
      expect(result).toBe(maxHit + damageBonus);
      vi.restoreAllMocks();
    });

    it("should return 1 + damageBonus with the lowest roll", () => {
      vi.spyOn(global.Math, "random").mockReturnValue(0);
      const maxHit = 6;
      const damageBonus = 5;

      let result = rollDamage(maxHit, damageBonus);
      expect(result).toBe(1 + damageBonus);
      vi.restoreAllMocks();
    });

    it("should apply critDamage modifier with a successful crit roll", () => {
      const mockMathRandom = vi.spyOn(global.Math, "random");

      mockMathRandom
        .mockImplementationOnce(() => 1)
        .mockImplementationOnce(() => 1);

      const maxHit = 6;
      const damageBonus = 5;
      const critChance = 5;
      const critDamage = 3;

      let result = rollDamage(maxHit, damageBonus, critChance, critDamage);
      expect(result).toBe((maxHit + damageBonus) * critDamage);
      vi.restoreAllMocks();
    });

    it("should not apply critDamage modifier with a failed crit roll", () => {
      const mockMathRandom = vi.spyOn(global.Math, "random");

      mockMathRandom
        .mockImplementationOnce(() => 1)
        .mockImplementationOnce(() => 0);

      const maxHit = 6;
      const damageBonus = 5;
      const critChance = 5;
      const critDamage = 3;

      let result = rollDamage(maxHit, damageBonus, critChance, critDamage);
      expect(result).toBe(maxHit + damageBonus);
      vi.restoreAllMocks();
    });
  });
});
