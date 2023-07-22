import reactRefresh from "@vitejs/plugin-react";
import { createApp } from "vinxi";
import {
  BaseFileSystemRouter,
  analyzeModule,
  cleanPath,
} from "vinxi/file-system-router";

class WouterFileSystemRouter extends BaseFileSystemRouter {
  toPath(src) {
    const routePath = cleanPath(src, this.config)
      // remove the initial slash
      .slice(1)
      .replace(/index$/, "")
      .replace(/\[([^\/]+)\]/g, (_, m) => {
        if (m.length > 3 && m.startsWith("...")) {
          return `*${m.slice(3)}`;
        }
        if (m.length > 2 && m.startsWith("[") && m.endsWith("]")) {
          return `:${m.slice(1, -1)}?`;
        }
        return `:${m}`;
      });

    return routePath?.length > 0 ? `/${routePath}` : "/";
  }

  toRoute(src) {
    let path = this.toPath(src);

    return {
      $component: {
        src: src,
        pick: ["default", "$css"],
      },
      path,
      filePath: src,
    };
  }
}

export default createApp({
  routers: [
    {
      name: "public",
      mode: "static",
      dir: "./public",
      base: "/",
    },
    {
      name: "client",
      mode: "build",
      dir: "./app/pages",
      style: WouterFileSystemRouter,
      handler: "./app/client.tsx",
      build: {
        target: "browser",
        plugins: () => [reactRefresh()],
      },
      base: "/_build",
    },
    {
      name: "ssr",
      mode: "handler",
      handler: "./app/server.tsx",
      dir: "./app/pages",
      style: WouterFileSystemRouter,
      build: {
        target: "node",
      },
    },
  ],
});
