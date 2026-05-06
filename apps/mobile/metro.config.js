const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");
const { createRequire } = require("node:module");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

// babel-preset-expo is hoisted to root node_modules and calls require.resolve('expo-router')
// to decide whether to inject the EXPO_ROUTER_APP_ROOT substitution plugin.
// expo-router lives in apps/mobile/node_modules, so it can't be found via normal resolution.
// Setting NODE_PATH here is inherited by all Metro worker processes.
const localNodeModules = path.resolve(projectRoot, "node_modules");
if (!process.env.NODE_PATH?.includes(localNodeModules)) {
  process.env.NODE_PATH = process.env.NODE_PATH
    ? `${localNodeModules}${path.delimiter}${process.env.NODE_PATH}`
    : localNodeModules;
}

// require() that resolves from the monorepo root — finds root react/react-native copies.
const monorepoRequire = createRequire(path.join(monorepoRoot, "package.json"));

const config = getDefaultConfig(projectRoot);

// Ensure Metro watches the entire monorepo root so shared packages are visible.
config.watchFolders = [monorepoRoot, ...(config.watchFolders ?? [])];

// Force React to always resolve to the single root copy.
// apps/mobile/node_modules/react is v19.1.0 but ReactFabric (react-native renderer)
// at the root was built against v19.2.4 — two instances cause "Invalid hook call".
// resolveRequest is an override interceptor, unlike extraNodeModules which is only a fallback.
const ROOT_SINGLETONS = new Set([
  "react",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
  "react/compiler-runtime",
]);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (ROOT_SINGLETONS.has(moduleName)) {
    return {
      type: "sourceFile",
      filePath: monorepoRequire.resolve(moduleName),
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
