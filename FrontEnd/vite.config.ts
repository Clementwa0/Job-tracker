import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  optimizeDeps: {
    include: ["mammoth", "docx"],
  },

  build: {
    target: "esnext",
    minify: "esbuild",
    sourcemap: true,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react")) return "react-vendor";
            if (id.includes("recharts")) return "charts";
            if (id.includes("pdfjs-dist")) return "pdf";
            if (id.includes("xlsx")) return "excel";
            if (id.includes("mammoth")) return "mammoth";
            if (id.includes("docx")) return "docx";
            return "vendor";
          }
        },
      },
    },
  },
});
