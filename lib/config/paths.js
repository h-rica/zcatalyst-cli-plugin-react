"use strict";

const path = require("path");
const fs = require("fs");
const getPublicUrlOrPath = require("react-dev-utils/getPublicUrlOrPath");

const resolveApp = (userDir) => (relativePath) =>
  path.resolve(fs.realpathSync(userDir), relativePath);

const buildPath = process.env.BUILD_PATH || "build";

const moduleFileExtensions = [
  "web.mjs",
  "mjs",
  "web.js",
  "js",
  "web.ts",
  "ts",
  "web.tsx",
  "tsx",
  "json",
  "web.jsx",
  "jsx",
];

// Resolve file paths in the same order as webpack
const resolveModule = (resolveFn, filePath) => {
  const extension = moduleFileExtensions.find((extension) =>
    fs.existsSync(resolveFn(`${filePath}.${extension}`))
  );

  if (extension) {
    return resolveFn(`${filePath}.${extension}`);
  }

  return resolveFn(`${filePath}.js`);
};

/**
 * Detects if the project is using Vite based on package.json dependencies
 * @param {string} userDir - The user's project directory
 * @returns {boolean} True if Vite is detected
 */
const isViteProject = (userDir) => {
  try {
    const packageJsonPath = resolveApp(userDir)("package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };
    return "vite" in allDeps;
  } catch (e) {
    return false;
  }
};

module.exports = (userDir) => {
  userDir = userDir || process.env.X_CATALYST_WEBAPP_PATH;
  const packageJSONPth = resolveApp(userDir)("package.json");
  const packageJSONStr = fs.readFileSync(packageJSONPth);
  const packageJSON = JSON.parse(packageJSONStr);

  const isVite = isViteProject(userDir);

  // Determine build output directory based on build tool
  // Vite uses 'dist' by default, Webpack uses 'build'
  const outputDir = isVite ? process.env.BUILD_PATH || "dist" : buildPath;

  // Determine index.html location
  // Vite projects typically have index.html at root, CRA has it in public/
  let htmlPath = resolveApp(userDir)("public/index.html");
  if (isVite) {
    const rootHtml = resolveApp(userDir)("index.html");
    if (fs.existsSync(rootHtml)) {
      htmlPath = rootHtml;
    }
  }

  // Determine entry point
  // Vite projects often use main.tsx/main.jsx, CRA uses index.tsx/index.jsx
  let entryPoint = resolveModule(resolveApp(userDir), "src/index");
  if (isVite) {
    const mainTsx = resolveApp(userDir)("src/main.tsx");
    const mainJsx = resolveApp(userDir)("src/main.jsx");
    const mainTs = resolveApp(userDir)("src/main.ts");
    const mainJs = resolveApp(userDir)("src/main.js");

    if (fs.existsSync(mainTsx)) {
      entryPoint = mainTsx;
    } else if (fs.existsSync(mainJsx)) {
      entryPoint = mainJsx;
    } else if (fs.existsSync(mainTs)) {
      entryPoint = mainTs;
    } else if (fs.existsSync(mainJs)) {
      entryPoint = mainJs;
    }
  }

  return {
    dotenv: resolveApp(userDir)(".env"),
    appPath: resolveApp(userDir)("."),
    appBuild: resolveApp(userDir)(outputDir),
    appPublic: resolveApp(userDir)("public"),
    appHtml: htmlPath,
    appIndexJs: entryPoint,
    appPackageJson: resolveApp(userDir)("package.json"),
    appSrc: resolveApp(userDir)("src"),
    appTsConfig: resolveApp(userDir)("tsconfig.json"),
    appJsConfig: resolveApp(userDir)("jsconfig.json"),
    yarnLockFile: resolveApp(userDir)("yarn.lock"),
    testsSetup: resolveModule(resolveApp(userDir), "src/setupTests"),
    proxySetup: resolveApp(userDir)("src/setupProxy.js"),
    appNodeModules: resolveApp(userDir)("node_modules"),
    swSrc: resolveModule(resolveApp(userDir), "src/service-worker"),
    publicUrlOrPath: getPublicUrlOrPath(
      process.env.NODE_ENV === "development",
      packageJSON.homepage || "/app/",
      process.env.PUBLIC_URL
    ),
    moduleFileExtensions,
    isVite,
  };
};
