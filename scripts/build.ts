import dts from "bun-plugin-dts";

await Bun.build({
	entrypoints: ["src/index.ts"],
	outdir: "./dist",
	target: "node",
	format: "esm",
	splitting: false,
	sourcemap: "external",
	minify: false,
	plugins: [
		dts() // Generate TypeScript declaration files (.d.ts)
	]
});
