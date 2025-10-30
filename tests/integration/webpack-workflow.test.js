"use strict";

const path = require("path");
const fs = require("fs-extra");
const BuildToolDetector = require("../../lib/detector/build-tool-detector");
const WebpackAdapter = require("../../lib/adapters/webpack-adapter");

describe("Webpack Workflow Integration Tests", () => {
  const fixtureDir = path.join(__dirname, "../fixtures/webpack-project");
  let detector;
  let adapter;
  let paths;

  beforeAll(() => {
    // Ensure fixture directory exists
    if (!fs.existsSync(fixtureDir)) {
      throw new Error(`Webpack fixture not found at ${fixtureDir}`);
    }
  });

  beforeEach(() => {
    detector = new BuildToolDetector(fixtureDir);

    // Create paths configuration for the fixture
    paths = {
      dotenv: path.join(fixtureDir, ".env"),
      appPath: fixtureDir,
      appBuild: path.join(fixtureDir, "build"),
      appPublic: path.join(fixtureDir, "public"),
      appHtml: path.join(fixtureDir, "public", "index.html"),
      appIndexJs: path.join(fixtureDir, "src", "index.tsx"),
      appPackageJson: path.join(fixtureDir, "package.json"),
      appSrc: path.join(fixtureDir, "src"),
      appTsConfig: path.join(fixtureDir, "tsconfig.json"),
      appJsConfig: path.join(fixtureDir, "jsconfig.json"),
      appNodeModules: path.join(fixtureDir, "node_modules"),
      publicUrlOrPath: "/app/",
      moduleFileExtensions: ["tsx", "ts", "jsx", "js", "json"],
    };

    adapter = new WebpackAdapter(fixtureDir, paths);
  });

  afterEach(async () => {
    // Clean up build directory after each test
    const buildDir = path.join(fixtureDir, "build");
    if (fs.existsSync(buildDir)) {
      await fs.remove(buildDir);
    }
  });

  describe("Build Tool Detection", () => {
    test("should detect Webpack from react-scripts", () => {
      const buildTool = detector.detect();
      expect(buildTool).toBe("webpack");
    });

    test("should return detailed build tool information", () => {
      const details = detector.getDetails();

      expect(details.buildTool).toBe("webpack");
      expect(details.version).toBeDefined();
    });
  });

  describe("Validation", () => {
    test("should validate Webpack project structure", () => {
      // Check that required files exist
      expect(fs.existsSync(paths.appHtml)).toBe(true);
      expect(fs.existsSync(paths.appIndexJs)).toBe(true);
      expect(fs.existsSync(paths.appPackageJson)).toBe(true);
      expect(fs.existsSync(paths.appPublic)).toBe(true);
    });

    test("should detect TypeScript support", () => {
      const tsConfigPath = path.join(fixtureDir, "tsconfig.json");
      expect(fs.existsSync(tsConfigPath)).toBe(true);

      const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, "utf8"));
      expect(tsConfig.compilerOptions.jsx).toBe("react-jsx");
    });

    test("should verify entry point is TypeScript", () => {
      expect(paths.appIndexJs).toContain(".tsx");
      expect(fs.existsSync(paths.appIndexJs)).toBe(true);
    });
  });

  describe("Project Structure", () => {
    test("should have correct CRA file structure", () => {
      const expectedFiles = [
        "package.json",
        "public/index.html",
        "tsconfig.json",
        "src/index.tsx",
        "src/App.tsx",
        "src/App.css",
        "src/index.css",
      ];

      expectedFiles.forEach((file) => {
        const filePath = path.join(fixtureDir, file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });

    test("should have index.html in public directory", () => {
      const indexHtmlPath = path.join(fixtureDir, "public", "index.html");
      expect(fs.existsSync(indexHtmlPath)).toBe(true);

      const content = fs.readFileSync(indexHtmlPath, "utf8");
      expect(content).toContain('<div id="root"></div>');
      expect(content).toContain("%PUBLIC_URL%");
    });

    test("should have valid React components", () => {
      const appPath = path.join(fixtureDir, "src", "App.tsx");
      const content = fs.readFileSync(appPath, "utf8");

      expect(content).toContain("import React");
      expect(content).toContain("function App()");
      expect(content).toContain("export default App");
    });

    test("should have entry point using ReactDOM.createRoot", () => {
      const indexPath = path.join(fixtureDir, "src", "index.tsx");
      const content = fs.readFileSync(indexPath, "utf8");

      expect(content).toContain("ReactDOM.createRoot");
      expect(content).toContain("document.getElementById('root')");
    });
  });

  describe("Configuration", () => {
    test("should have valid package.json with react-scripts", () => {
      const packageJsonPath = path.join(fixtureDir, "package.json");
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

      expect(packageJson.dependencies).toHaveProperty("react");
      expect(packageJson.dependencies).toHaveProperty("react-dom");
      expect(packageJson.dependencies).toHaveProperty("react-scripts");

      expect(packageJson.scripts).toHaveProperty("start");
      expect(packageJson.scripts).toHaveProperty("build");
      expect(packageJson.scripts.start).toContain("react-scripts start");
      expect(packageJson.scripts.build).toContain("react-scripts build");
    });

    test("should have browserslist configuration", () => {
      const packageJsonPath = path.join(fixtureDir, "package.json");
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

      expect(packageJson.browserslist).toBeDefined();
      expect(packageJson.browserslist.production).toBeDefined();
      expect(packageJson.browserslist.development).toBeDefined();
    });
  });

  describe("Adapter Methods", () => {
    test("should return correct build tool name", () => {
      expect(adapter.getBuildToolName()).toBe("Webpack");
    });

    test("should have all required adapter methods", () => {
      expect(typeof adapter.validate).toBe("function");
      expect(typeof adapter.build).toBe("function");
      expect(typeof adapter.start).toBe("function");
      expect(typeof adapter.getBuildToolName).toBe("function");
    });
  });

  describe("Backward Compatibility", () => {
    test("should maintain CRA project structure", () => {
      // Verify standard CRA structure is maintained
      const publicDir = path.join(fixtureDir, "public");
      const srcDir = path.join(fixtureDir, "src");

      expect(fs.existsSync(publicDir)).toBe(true);
      expect(fs.existsSync(srcDir)).toBe(true);

      // Verify public directory contains index.html
      const indexHtml = path.join(publicDir, "index.html");
      expect(fs.existsSync(indexHtml)).toBe(true);
    });

    test("should support standard CRA scripts", () => {
      const packageJsonPath = path.join(fixtureDir, "package.json");
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

      // Verify all standard CRA scripts are present
      expect(packageJson.scripts.start).toBe("react-scripts start");
      expect(packageJson.scripts.build).toBe("react-scripts build");
      expect(packageJson.scripts.test).toBe("react-scripts test");
      expect(packageJson.scripts.eject).toBe("react-scripts eject");
    });
  });
});
