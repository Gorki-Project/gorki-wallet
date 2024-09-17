import fs from "node:fs/promises";
import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { spawn } from "node:child_process";
import tsconfigPaths from "vite-tsconfig-paths";

function reindex_icons() {
    let running_script = false;

    return <Plugin<any>>{
        name: "reindex-icons",
        async watchChange(path) {
            if (running_script) return;
            if (path.endsWith("icons.tsx")) return;

            let code: string;
            try {
                code = await fs.readFile(path, "utf-8")
            } catch { return; }

            let has_icons = code.includes("<Icon ") || code.includes("icon(");
            if (!has_icons) return;

            running_script = true;
            console.log(`${path} changed, reindexing icons...`);
            spawn(
                "bash", ["src/assets/reindex.sh"], { stdio: "inherit" }
            ).on("exit", () => {
                running_script = false;
                console.log(`Reindexing icons finished!`);
            });
        },
    };
}

export default defineConfig({
    base: "https://knowit.systems/wallet/",
    plugins: [
        reindex_icons(),
        tsconfigPaths(),
        react(),
        svgr(),
        nodePolyfills({
            include: ["stream", "util", "crypto", "vm"],
        })
    ],
});

