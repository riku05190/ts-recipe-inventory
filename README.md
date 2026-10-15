# Overview

As a software engineer, my goal is to strengthen my skills in statically typed programming and domain modeling with TypeScript. I developed this project to explore how TypeScript's type safety, interface contracts, and asynchronous patterns can prevent runtime errors in real-world workflows.

The **Recipe & Ingredient Inventory Management System** is a TypeScript console application that tracks pantry inventory and manages multi-level recipes. It uses recursive traversal to aggregate ingredient requirements and estimated costs for nested sub-recipes, verifies stock availability, and simulates the baking process asynchronously.

The primary purpose was to demonstrate key TypeScript concepts:
- **Interfaces & Types:** Defining strict data contracts (`InventoryItem`, `RecipeRequirement`, `FeasibilityResult`).
- **Classes & OOP:** Encapsulating domain logic with TypeScript classes and parameter properties.
- **Recursion:** Aggregating nested sub-recipe requirements and generating ASCII hierarchy trees.
- **Async/Await:** Managing asynchronous data fetching and baking simulation delays.

[Software Demo Video](https://youtu.be/iqZdGRtqslg)

# Development Environment

- **IDE / Editor:** Visual Studio Code
- **Runtime & Package Manager:** Node.js (LTS) & npm
- **Version Control:** Git & GitHub

The project is written in **TypeScript (v5.7+)** targeting Node.js.

Key libraries and dependencies used include:
- **`typescript`**: Compiler (`tsc`) providing static typing and transpilations.
- **`ts-node`**: Execution engine to execute TypeScript files directly in development.
- **`jest` & `ts-jest`**: Unit testing framework with TypeScript support for automated test suites.
- **`@types/node` & `@types/jest`**: Type definitions providing autocompletion and compile-time type safety.

# Useful Websites

- [TypeScript Official Documentation](https://www.typescriptlang.org/docs/handbook/intro.html) - In-depth guide to TypeScript syntax, types, and language features.
- [TypeScript Classes Reference](https://www.typescriptlang.org/docs/handbook/2/classes.html) - Guide on class constructors, parameter properties, and inheritance.
- [Jest Testing Documentation](https://jestjs.io/docs/getting-started) - Documentation for unit testing setup and assertions with TypeScript.
- [MDN Web Docs - Async Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) - Reference for modern asynchronous programming using `async` and `await`.

# Future Work

- **Database Persistence:** Replace mock in-memory data with a persistent database (e.g., SQLite/PostgreSQL using Prisma) to save real-time inventory updates and custom recipes.
- **Unit Conversion Engine:** Implement automatic unit conversion algorithms (e.g., converting grams to kilograms, or teaspoons to milliliters) during recursive requirement aggregation.
- **Interactive CLI / Web UI:** Build an interactive terminal interface (using `inquirer`) or a RESTful API with a web frontend to allow users to dynamically create recipes and manage stock.
- **Expiration Date & Alert System:** Extend the `Ingredient` model to track expiration dates and notify users of near-expiry items to reduce food waste.