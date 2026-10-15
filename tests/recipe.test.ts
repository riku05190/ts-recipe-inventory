import {
    Ingredient,
    Recipe,
    InventoryManager,
    fetchInventoryData
} from "../src/recipe";

describe("Recipe & Ingredient Inventory System Unit Tests", () => {

    describe("Ingredient Class", () => {
        test("should instantiate correctly and display formatted info", () => {
            const flour = new Ingredient("Flour", 500, "g", 0.02);
            expect(flour.name).toBe("Flour");
            expect(flour.quantity).toBe(500);
            expect(flour.unit).toBe("g");
            expect(flour.costPerUnit).toBe(0.02);
            expect(flour.displayInfo()).toContain("Flour");
            expect(flour.calculateCost(200)).toBeCloseTo(4.00);
        });

        test("should throw an error for negative values", () => {
            expect(() => new Ingredient("Flour", -10, "g", 0.02)).toThrow("Quantity cannot be negative.");
            expect(() => new Ingredient("Flour", 10, "g", -0.02)).toThrow("Cost cannot be negative.");
        });
    });

    describe("Recipe Class - Recursion", () => {
        test("should recursively aggregate ingredients from single and multi-level sub-recipes", () => {
            // Level 2 sub-recipe
            const syrup = new Recipe("Vanilla Syrup", [
                { ingredient: new Ingredient("Sugar", 30, "g", 0.02), requiredAmount: 30 },
                { ingredient: new Ingredient("Vanilla Extract", 5, "ml", 0.10), requiredAmount: 5 }
            ]);

            // Level 1 sub-recipe (contains syrup)
            const frosting = new Recipe("Frosted Cream", [
                { ingredient: new Ingredient("Butter", 50, "g", 0.05), requiredAmount: 50 },
                { ingredient: new Ingredient("Sugar", 70, "g", 0.02), requiredAmount: 70 }
            ], [syrup]);

            // Main recipe (contains frosting)
            const cake = new Recipe("Layer Cake", [
                { ingredient: new Ingredient("Flour", 200, "g", 0.01), requiredAmount: 200 },
                { ingredient: new Ingredient("Sugar", 100, "g", 0.02), requiredAmount: 100 }
            ], [frosting]);

            // Batch multiplier 1
            const totals = cake.getAllIngredients(1);

            // Flour: 200
            expect(totals.get("Flour")?.amount).toBe(200);
            // Butter: 50
            expect(totals.get("Butter")?.amount).toBe(50);
            // Vanilla Extract: 5
            expect(totals.get("Vanilla Extract")?.amount).toBe(5);
            // Sugar: 100 (Cake) + 70 (Frosting) + 30 (Syrup) = 200
            expect(totals.get("Sugar")?.amount).toBe(200);
        });

        test("should apply multiplier correctly across all recursive levels", () => {
            const sub = new Recipe("Sub", [
                { ingredient: new Ingredient("Cocoa", 10, "g", 0.03), requiredAmount: 10 }
            ]);
            const main = new Recipe("Main", [
                { ingredient: new Ingredient("Flour", 100, "g", 0.01), requiredAmount: 100 }
            ], [sub]);

            const multiplier = 3;
            const totals = main.getAllIngredients(multiplier);

            expect(totals.get("Flour")?.amount).toBe(300);
            expect(totals.get("Cocoa")?.amount).toBe(30);
        });

        test("should recursively calculate total recipe cost", () => {
            const sub = new Recipe("Filling", [
                { ingredient: new Ingredient("Jam", 50, "g", 0.04), requiredAmount: 50 } // 50 * 0.04 = 2.00
            ]);
            const main = new Recipe("Tart", [
                { ingredient: new Ingredient("Pastry", 100, "g", 0.02), requiredAmount: 100 } // 100 * 0.02 = 2.00
            ], [sub]);

            const costSingle = main.calculateTotalCost(1);
            expect(costSingle).toBeCloseTo(4.00);

            const costDouble = main.calculateTotalCost(2);
            expect(costDouble).toBeCloseTo(8.00);
        });

        test("should recursively generate string hierarchy format", () => {
            const sub = new Recipe("Sub-Recipe", [
                { ingredient: new Ingredient("Salt", 5, "g", 0.01), requiredAmount: 5 }
            ]);
            const main = new Recipe("Main-Recipe", [
                { ingredient: new Ingredient("Water", 100, "ml", 0.001), requiredAmount: 100 }
            ], [sub]);

            const tree = main.formatTree();
            expect(tree).toContain("Main-Recipe");
            expect(tree).toContain("Sub-Recipe");
            expect(tree).toContain("Salt");
            expect(tree).toContain("Water");
        });
    });

    describe("InventoryManager Class", () => {
        test("should correctly determine feasibility and deduct items", () => {
            const inventory = new InventoryManager([
                new Ingredient("Flour", 500, "g", 0.01),
                new Ingredient("Sugar", 300, "g", 0.02)
            ]);

            const recipe = new Recipe("Pancake", [
                { ingredient: new Ingredient("Flour", 200, "g", 0.01), requiredAmount: 200 },
                { ingredient: new Ingredient("Sugar", 100, "g", 0.02), requiredAmount: 100 }
            ]);

            // Single batch: feasible
            const check1 = inventory.checkRecipeFeasibility(recipe, 1);
            expect(check1.feasible).toBe(true);
            expect(check1.missing).toHaveLength(0);

            // 3 batches: needs 600g flour (only 500g available)
            const check3 = inventory.checkRecipeFeasibility(recipe, 3);
            expect(check3.feasible).toBe(false);
            expect(check3.missing[0].name).toBe("Flour");
            expect(check3.missing[0].required).toBe(600);
            expect(check3.missing[0].available).toBe(500);

            // Deduct batch 1
            const deducted = inventory.deductRecipeIngredients(recipe, 1);
            expect(deducted).toBe(true);
            expect(inventory.getIngredient("Flour")?.quantity).toBe(300);
            expect(inventory.getIngredient("Sugar")?.quantity).toBe(200);

            // Trying to deduct 2 batches (needs 400 flour, only 300 left): should fail
            const secondDeduct = inventory.deductRecipeIngredients(recipe, 2);
            expect(secondDeduct).toBe(false);
            // Quantities should remain unchanged
            expect(inventory.getIngredient("Flour")?.quantity).toBe(300);
        });
    });

    describe("Asynchronous Functions", () => {
        test("fetchInventoryData should asynchronously return a list of ingredients", async () => {
            const data = await fetchInventoryData();
            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBeGreaterThan(0);
            expect(data[0]).toBeInstanceOf(Ingredient);
        });
    });
});
