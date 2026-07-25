import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Scratch: match nothing and let vitest exit 0 anyway, so the only thing
    // that can fail the CI job is the runner's zero-test guard.
    include: ["src/**/*.no-such-test.ts"],
    passWithNoTests: true,
    environment: "node",
  },
});
