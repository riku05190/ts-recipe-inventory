import {
    Ingredient,
    Recipe,
    InventoryManager,
    fetchInventoryData,
    simulateBakingProcess
} from "./recipe";

/**
 * Main application entry point demonstrating:
 * 1. Asynchronous data retrieval (fetchInventoryData)
 * 2. Object-Oriented Programming with Classes (Ingredient, Recipe, InventoryManager)
 * 3. List manipulation (filtering, mapping, iterating)
 * 4. Recursion (multi-tier sub-recipe breakdown, cost calculation, tree formatting)
 * 5. Clean, readable Terminal Output
 */
async function main() {
    console.log("=".repeat(65));
    console.log("       🍳 RECIPE & INGREDIENT INVENTORY MANAGEMENT SYSTEM       ");
    console.log("=".repeat(65));

    // 1. Asynchronous Data Loading
    console.log("\n[1/5] 📡 Fetching current inventory from database asynchronously...");
    const initialIngredients = await fetchInventoryData();
    const inventory = new InventoryManager(initialIngredients);
    console.log("      ✓ Inventory successfully loaded!");

    // 2. Display Initial Inventory (Lists & Classes)
    console.log("\n[2/5] 📦 Current Refrigerator & Pantry Inventory:");
    console.log("-".repeat(65));
    inventory.listAll().forEach((item) => {
        console.log(item.displayInfo());
    });
    console.log("-".repeat(65));

    // 3. Define Recipes with Nested Sub-Recipes (Demonstrating Recursion)
    console.log("\n[3/5] 📜 Assembling Recipes with Multi-Level Sub-Recipes:");

    // Level 2 Sub-Recipe: Chocolate Ganache
    const ganache = new Recipe("Rich Chocolate Ganache", [
        { ingredient: new Ingredient("Chocolate Chips", 100, "g", 0.035), requiredAmount: 80 },
        { ingredient: new Ingredient("Unsalted Butter", 40, "g", 0.045), requiredAmount: 30 }
    ]);

    // Level 1 Sub-Recipe: Chocolate Frosting (includes Ganache as sub-recipe!)
    const frosting = new Recipe("Double Chocolate Frosting", [
        { ingredient: new Ingredient("Granulated Sugar", 120, "g", 0.015), requiredAmount: 100 },
        { ingredient: new Ingredient("Cocoa Powder", 50, "g", 0.025), requiredAmount: 40 },
        { ingredient: new Ingredient("Unsalted Butter", 80, "g", 0.045), requiredAmount: 60 }
    ], [ganache]);

    // Top-Level Recipe: Deluxe Celebration Cake (includes Frosting as sub-recipe)
    const cakeRecipe = new Recipe("Deluxe Celebration Layer Cake", [
        { ingredient: new Ingredient("All-Purpose Flour", 300, "g", 0.008), requiredAmount: 280 },
        { ingredient: new Ingredient("Granulated Sugar", 200, "g", 0.015), requiredAmount: 180 },
        { ingredient: new Ingredient("Unsalted Butter", 120, "g", 0.045), requiredAmount: 100 },
        { ingredient: new Ingredient("Eggs", 4, "pcs", 0.30), requiredAmount: 4 },
        { ingredient: new Ingredient("Whole Milk", 200, "ml", 0.004), requiredAmount: 180 },
        { ingredient: new Ingredient("Vanilla Extract", 10, "ml", 0.12), requiredAmount: 8 }
    ], [frosting]);

    // Display Recipe Tree (Recursion 1: Hierarchy formatting)
    console.log(cakeRecipe.formatTree());

    // 4. Recursive Requirement Aggregation & Cost Calculation
    const batchMultiplier = 2; // Baking 2 cakes!
    console.log(`[4/5] 🔄 Calculating Total Aggregated Ingredients (Batch x${batchMultiplier}):`);
    console.log("      (Recursively aggregating direct items + Frosting + Ganache...)");

    const totalRequirements = cakeRecipe.getAllIngredients(batchMultiplier);
    const totalCost = cakeRecipe.calculateTotalCost(batchMultiplier);

    console.log("\n" + "-".repeat(65));
    console.log(` Total Requirements for ${batchMultiplier}x "${cakeRecipe.title}":`);
    console.log("-".repeat(65));
    totalRequirements.forEach((req, name) => {
        const itemCost = req.ingredient.calculateCost(req.amount);
        console.log(`  • ${name.padEnd(20)}: ${req.amount.toString().padStart(5)} ${req.unit.padEnd(4)} (Est. Cost: $${itemCost.toFixed(2)})`);
    });
    console.log("-".repeat(65));
    console.log(`  💰 Total Estimated Batch Cost: $${totalCost.toFixed(2)}`);
    console.log("-".repeat(65));

    // 5. Stock Feasibility Verification & Async Baking
    console.log("\n[5/5] 🔍 Checking Inventory Feasibility & Deducting Stock:");
    
    // First attempt: Batch x2 (Will catch shortage)
    console.log(`\n  --- Attempt 1: Batch x${batchMultiplier} ---`);
    const feasibility2 = inventory.checkRecipeFeasibility(cakeRecipe, batchMultiplier);

    if (feasibility2.feasible) {
        console.log("      ✓ All ingredients are sufficiently stocked in inventory!");
    } else {
        console.log("      ✗ Insufficient inventory for 2 batches!");
        console.log("      Missing Items:");
        feasibility2.missing.forEach(m => {
            console.log(`      - ${m.name}: Need ${m.required} ${m.unit}, only have ${m.available} ${m.unit}`);
        });
    }

    // Second attempt: Batch x1 (Will succeed and bake)
    console.log(`\n  --- Attempt 2: Adjusted to Batch x1 ---`);
    const feasibility1 = inventory.checkRecipeFeasibility(cakeRecipe, 1);

    if (feasibility1.feasible) {
        console.log("      ✓ Ingredients verified for 1 batch. Ready to bake!");
        console.log("      ⏳ Starting asynchronous baking process (async/await)...");
        await simulateBakingProcess(cakeRecipe.title, 800);
        console.log("      ✨ Ding! Baking completed successfully!");

        // Deduct from inventory
        inventory.deductRecipeIngredients(cakeRecipe, 1);

        console.log("\n📋 Updated Inventory After Baking 1 Batch:");
        console.log("-".repeat(65));
        inventory.listAll().forEach((item) => {
            console.log(item.displayInfo());
        });
        console.log("-".repeat(65));
    }

    console.log("\n" + "=".repeat(65));
    console.log("                 SYSTEM EXECUTION COMPLETED                      ");
    console.log("=".repeat(65));
}

main().catch(err => {
    console.error("An error occurred during execution:", err);
});
