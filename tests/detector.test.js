"use strict";

const fs = require("fs");
const BuildToolDetector = require("../lib/detector/build-tool-detector");

// Mock fs module
jest.mock("fs");

describe("BuildToolDetector", () => {
  let mockUserDir;
  let detector;

  beforeEach(() => {
    mockUserDir = "/mock/project";
    detector = new BuildToolDetector(mockUserDir);
    jest.clearAllMocks();
  });

  describe("detect()", () => {
    test("should detect Vite when vite is in dependencies", () => {
      const mockPackageJson = {
        dependencies: { vite: "^5.0.0", react: "^18.0.0" },
      };

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = detector.detect();
      expect(result).toBe("vite");
    });

    test("should detect Vite when vite.config.js exists", () => {
      const mockPackageJson = {
        dependencies: { react: "^18.0.0" },
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));
      fs.existsSync.mockImplementation((filePath) => {
        if (filePath.includes("package.json")) return true;
        if (filePath.includes("vite.config.js")) return true;
        return false;
      });

      const result = detector.detect();
      expect(result).toBe("vite");
    });

    test("should detect Webpack when react-scripts is in dependencies", () => {
      const mockPackageJson = {
        dependencies: { "react-scripts": "^5.0.0", react: "^18.0.0" },
      };

      fs.existsSync.mockImplementation((filePath) => {
        // Return true only for package.json, false for Vite config files
        if (filePath.includes("package.json")) return true;
        return false;
      });
      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = detector.detect();
      expect(result).toBe("webpack");
    });

    test("should detect Webpack when webpack is in devDependencies", () => {
      const mockPackageJson = {
        dependencies: { react: "^18.0.0" },
        devDependencies: { webpack: "^5.0.0" },
      };

      fs.existsSync.mockImplementation((filePath) => {
        // Return true only for package.json, false for Vite config files
        if (filePath.includes("package.json")) return true;
        return false;
      });
      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = detector.detect();
      expect(result).toBe("webpack");
    });

    test("should prioritize Vite over Webpack when both are present", () => {
      const mockPackageJson = {
        dependencies: { vite: "^5.0.0", "react-scripts": "^5.0.0" },
      };

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = detector.detect();
      expect(result).toBe("vite");
    });

    test("should throw error when package.json is missing", () => {
      fs.existsSync.mockReturnValue(false);

      expect(() => detector.detect()).toThrow("package.json not found");
    });

    test("should throw error when no supported build tool is found", () => {
      const mockPackageJson = {
        dependencies: { react: "^18.0.0" },
      };

      fs.existsSync.mockImplementation((filePath) => {
        // Return true only for package.json, false for all config files
        if (filePath.includes("package.json")) return true;
        return false;
      });
      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      expect(() => detector.detect()).toThrow(
        "No supported build tool detected"
      );
    });
  });

  describe("getDetails()", () => {
    test("should return detailed information for Vite project", () => {
      const mockPackageJson = {
        dependencies: { vite: "^5.0.0", react: "^18.0.0" },
      };

      fs.existsSync.mockImplementation((filePath) => {
        if (filePath.includes("package.json")) return true;
        if (filePath.includes("vite.config.js")) return true;
        return false;
      });
      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const details = detector.getDetails();

      expect(details.buildTool).toBe("vite");
      expect(details.version).toBe("^5.0.0");
      expect(details.hasConfigFile).toBe(true);
      expect(details.configFilePath).toContain("vite.config.js");
    });

    test("should return detailed information for Webpack project", () => {
      const mockPackageJson = {
        dependencies: { "react-scripts": "^5.0.0", react: "^18.0.0" },
      };

      fs.existsSync.mockImplementation((filePath) => {
        // Return true only for package.json, false for Vite config files
        if (filePath.includes("package.json")) return true;
        return false;
      });
      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const details = detector.getDetails();

      expect(details.buildTool).toBe("webpack");
      expect(details.version).toBe("^5.0.0");
    });
  });
});
