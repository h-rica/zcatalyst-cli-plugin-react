"use strict";

const { PluginError, ErrorCategory } = require("../lib/utils/plugin-error");

describe("PluginError", () => {
  test("should create error with message and category", () => {
    const error = new PluginError("Test error", ErrorCategory.VALIDATION);

    expect(error.message).toBe("Test error");
    expect(error.category).toBe(ErrorCategory.VALIDATION);
    expect(error.name).toBe("PluginError");
  });

  test("should include details when provided", () => {
    const details = {
      suggestion: "Try running npm install",
      buildTool: "vite",
    };
    const error = new PluginError("Build failed", ErrorCategory.BUILD, details);

    expect(error.details.suggestion).toBe("Try running npm install");
    expect(error.details.buildTool).toBe("vite");
  });

  test("should format error message with category", () => {
    const error = new PluginError("Test error", ErrorCategory.VALIDATION);
    const formatted = error.format();

    expect(formatted).toContain("[VALIDATION]");
    expect(formatted).toContain("Test error");
  });

  test("should include suggestion in formatted output", () => {
    const error = new PluginError(
      "Missing dependency",
      ErrorCategory.DEPENDENCY,
      { suggestion: "Run npm install vite" }
    );
    const formatted = error.format();

    expect(formatted).toContain("Suggestion:");
    expect(formatted).toContain("Run npm install vite");
  });

  test("should include build tool in formatted output", () => {
    const error = new PluginError("Build failed", ErrorCategory.BUILD, {
      buildTool: "vite",
    });
    const formatted = error.format();

    expect(formatted).toContain("Build tool: vite");
  });

  test("should include original error in formatted output", () => {
    const originalError = new Error("Original error message");
    const error = new PluginError("Wrapped error", ErrorCategory.BUILD, {
      originalError,
    });
    const formatted = error.format();

    expect(formatted).toContain("Original error:");
    expect(formatted).toContain("Original error message");
  });

  test("should have all error categories defined", () => {
    expect(ErrorCategory.VALIDATION).toBe("VALIDATION");
    expect(ErrorCategory.BUILD).toBe("BUILD");
    expect(ErrorCategory.DEV_SERVER).toBe("DEV_SERVER");
    expect(ErrorCategory.CONFIGURATION).toBe("CONFIGURATION");
    expect(ErrorCategory.DEPENDENCY).toBe("DEPENDENCY");
  });
});
