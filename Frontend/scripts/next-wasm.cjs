const path = require("node:path");

// This environment needs the bundled WASM SWC fallback because its native
// Windows SWC binary cannot be loaded. Next.js 16 requires webpack with WASM.
const nextPackage = path.dirname(require.resolve("next/package.json"));
process.env.NEXT_TEST_WASM_DIR = path.join(
  nextPackage,
  "..",
  "@next",
  "swc-wasm-nodejs",
);

const nextCli = path.join(nextPackage, "dist", "bin", "next");
require(nextCli);
