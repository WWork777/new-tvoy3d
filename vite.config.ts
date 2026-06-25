import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  // Передаем дополнительные настройки для Vite сборщика
  vite: {
    build: {
      ssr: true,
      target: "esnext",
      minify: false, // временно отключим, чтобы в логах ошибок были видны точные строки кода
      rollupOptions: {
        output: {
          format: "esm",
        },
      },
    },
  },
});
