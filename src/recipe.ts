// ============================================================================
// Recipe & Ingredient Inventory System in TypeScript
// Module 2 Requirements: Classes, Lists, Recursion, Async/Await, Terminal Output
// ============================================================================

/**
 * 1. Interfaces
 */
export interface InventoryItem {
    name: string;
    quantity: number;
    unit: string;
}

export interface RecipeRequirement {
    ingredient: Ingredient;
    requiredAmount: number;
}

export interface FeasibilityResult {
    feasible: boolean;
    missing: {
        name: string;
        required: number;
        available: number;
        unit: string;
    }[];
}

/**
 * 2. Classes
 */

/**
 * Class representing a specific food ingredient with inventory quantity and cost.
 */
export class Ingredient implements InventoryItem {
    constructor(
        public name: string,
        public quantity: number,
        public unit: string,
        public costPerUnit: number
    ) {
        if (quantity < 0) throw new Error("Quantity cannot be negative.");
        if (costPerUnit < 0) throw new Error("Cost cannot be negative.");
    }

    /**
     * Formats ingredient info for console display
     */
    public displayInfo(): string {
        return `- ${this.name.padEnd(18)}: ${this.quantity.toString().padStart(5)} ${this.unit.padEnd(4)} ($${this.costPerUnit.toFixed(2)} / ${this.unit})`;
    }

    /**
     * Calculate cost for a specific quantity
     */
    public calculateCost(amount: number): number {
        return amount * this.costPerUnit;
    }
}

/**
 * Class representing a recipe, which can contain direct ingredients and nested sub-recipes.
 * Uses recursion for requirement calculation, cost estimation, and hierarchy visualization.
 */
export class Recipe {
    constructor(
        public title: string,
        public ingredients: RecipeRequirement[],
        public subRecipes: Recipe[] = [] // Nested sub-recipes for recursion
    ) {}

    /**
     * [RECURSION 1]
     * Recursively traverses this recipe and all nested sub-recipes to aggregate
     * total ingredient requirements based on a batch multiplier.
     */
    public getAllIngredients(
        multiplier: number = 1,
        accumulator: Map<string, { amount: number; unit: string; ingredient: Ingredient }> = new Map()
    ): Map<string, { amount: number; unit: string; ingredient: Ingredient }> {
        // Base & Current Level: Add direct ingredients
        for (const item of this.ingredients) {
            const key = item.ingredient.name;
            const existing = accumulator.get(key);
            const additional = item.requiredAmount * multiplier;

            if (existing) {
                accumulator.set(key, {
                    amount: existing.amount + additional,
                    unit: item.ingredient.unit,
                    ingredient: item.ingredient
                });
            } else {
                accumulator.set(key, {
                    amount: additional,
                    unit: item.ingredient.unit,
                    ingredient: item.ingredient
                });
            }
        }

        // Recursive Step: Aggregate requirements from all sub-recipes
        for (const sub of this.subRecipes) {
            sub.getAllIngredients(multiplier, accumulator);
        }

        return accumulator;
    }

    /**
     * [RECURSION 2]
     * Recursively calculates the total estimated cost of all ingredients in the recipe.
     */
    public calculateTotalCost(multiplier: number = 1): number {
        let directCost = 0;
        for (const item of this.ingredients) {
            directCost += item.ingredient.calculateCost(item.requiredAmount * multiplier);
        }

        let subRecipesCost = 0;
        for (const sub of this.subRecipes) {
            subRecipesCost += sub.calculateTotalCost(multiplier);
        }

        return directCost + subRecipesCost;
    }

    /**
     * [RECURSION 3]
     * Recursively formats the recipe hierarchy tree for clear terminal display.
     */
    public formatTree(depth: number = 0, isLast: boolean = true, prefix: string = ""): string {
        let result = "";
        const connector = depth === 0 ? "🍳 " : (isLast ? "└── " : "├── ");
        result += `${prefix}${connector}${this.title}\n`;

        const newPrefix = depth === 0 ? "" : prefix + (isLast ? "    " : "│   ");

        // Display direct ingredients
        for (let i = 0; i < this.ingredients.length; i++) {
            const ing = this.ingredients[i];
            const hasSub = this.subRecipes.length > 0;
            const isLastIng = (i === this.ingredients.length - 1) && !hasSub;
            const ingBranch = isLastIng ? "└── " : "├── ";
            result += `${newPrefix}${ingBranch}🧪 ${ing.ingredient.name}: ${ing.requiredAmount} ${ing.ingredient.unit}\n`;
        }

        // Recursively display sub-recipes
        for (let i = 0; i < this.subRecipes.length; i++) {
            const sub = this.subRecipes[i];
            const isLastSub = (i === this.subRecipes.length - 1);
            result += sub.formatTree(depth + 1, isLastSub, newPrefix);
        }

        return result;
    }
}

/**
 * Class managing the current inventory stock and operations.
 */
export class InventoryManager {
    private items: Map<string, Ingredient> = new Map();

    constructor(initialItems: Ingredient[] = []) {
        for (const item of initialItems) {
            this.addIngredient(item);
        }
    }

    public addIngredient(ingredient: Ingredient): void {
        const existing = this.items.get(ingredient.name);
        if (existing) {
            existing.quantity += ingredient.quantity;
        } else {
            this.items.set(ingredient.name, new Ingredient(
                ingredient.name,
                ingredient.quantity,
                ingredient.unit,
                ingredient.costPerUnit
            ));
        }
    }

    public getIngredient(name: string): Ingredient | undefined {
        return this.items.get(name);
    }

    public listAll(): Ingredient[] {
        return Array.from(this.items.values());
    }

    /**
     * Checks if current inventory satisfies total recursive recipe requirements.
     */
    public checkRecipeFeasibility(recipe: Recipe, batchMultiplier: number = 1): FeasibilityResult {
        const totalNeeded = recipe.getAllIngredients(batchMultiplier);
        const missing: FeasibilityResult["missing"] = [];

        for (const [name, req] of totalNeeded.entries()) {
            const inStock = this.items.get(name);
            const availableAmount = inStock ? inStock.quantity : 0;

            if (availableAmount < req.amount) {
                missing.push({
                    name,
                    required: req.amount,
                    available: availableAmount,
                    unit: req.unit
                });
            }
        }

        return {
            feasible: missing.length === 0,
            missing
        };
    }

    /**
     * Deducts required ingredients from inventory if feasible.
     */
    public deductRecipeIngredients(recipe: Recipe, batchMultiplier: number = 1): boolean {
        const check = this.checkRecipeFeasibility(recipe, batchMultiplier);
        if (!check.feasible) {
            return false;
        }

        const totalNeeded = recipe.getAllIngredients(batchMultiplier);
        for (const [name, req] of totalNeeded.entries()) {
            const inStock = this.items.get(name)!;
            inStock.quantity -= req.amount;
        }
        return true;
    }
}

/**
 * 3. Asynchronous Functions
 */

/**
 * Simulates fetching initial inventory data from a remote server/database with network latency.
 */
export async function fetchInventoryData(): Promise<Ingredient[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                new Ingredient("All-Purpose Flour", 1200, "g", 0.008),
                new Ingredient("Granulated Sugar", 600, "g", 0.015),
                new Ingredient("Unsalted Butter", 350, "g", 0.045),
                new Ingredient("Chocolate Chips", 250, "g", 0.035),
                new Ingredient("Whole Milk", 1000, "ml", 0.004),
                new Ingredient("Eggs", 8, "pcs", 0.30),
                new Ingredient("Vanilla Extract", 50, "ml", 0.12),
                new Ingredient("Cocoa Powder", 150, "g", 0.025)
            ]);
        }, 600); // 600ms network delay simulation
    });
}

/**
 * Simulates an asynchronous cooking/baking timer step with progress feedback.
 */
export async function simulateBakingProcess(recipeTitle: string, durationMs: number = 800): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, durationMs);
    });
}
