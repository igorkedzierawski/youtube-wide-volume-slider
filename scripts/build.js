const { build, context } = require("esbuild");
const fs = require("fs");
const path = require("path");

const srcDir = "./src";
const outDir = "./unpacked/dist";
const entryPoints = JSON.parse(
    fs.readFileSync("./entryPoints.json", "utf8"),
).map(file => path.resolve(srcDir, file));

const isWatchMode = process.argv.includes("--watch");

const options = {
    outbase: srcDir,
    entryPoints: entryPoints,
    outdir: outDir,

    platform: "browser",
    bundle: true,
    minify: false,
    sourcemap: false,
    keepNames: true,
    treeShaking: true,

    resolveExtensions: [".ts", ".js", ".css", ".json"],

    tsconfig: "./tsconfig.json",
};

(async () => {
    try {
        if (isWatchMode) {
            console.log("Starting watch mode...");
            const ctx = await context(options);
            await ctx.watch();
            console.log("Watching for changes (Ctrl+C to stop)");
        } else {
            console.log("Building...");
            await build(options);
            console.log("Build completed successfully!");
        }
    } catch (error) {
        console.error("Build failed:", error.message || error);
        process.exit(1);
    }
})();
