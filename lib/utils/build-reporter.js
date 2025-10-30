"use strict";

const fs = require("fs-extra");
const path = require("path");
const chalk = require("react-dev-utils/chalk");
const filesize = require("filesize");
const gzipSize = require("gzip-size").sync;
const stripAnsi = require("strip-ansi");
const log = require("./logger").logger;

// Size thresholds for warnings
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024;
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024;

/**
 * Checks if an asset should be included in the report
 *
 * @param {string} fileName - The name of the file
 * @returns {boolean} True if the file should be reported
 */
function canReadAsset(fileName) {
  return (
    /\.(js|css)$/.test(fileName) &&
    !/service-worker\.js/.test(fileName) &&
    !/precache-manifest\.[0-9a-f]+\.js/.test(fileName)
  );
}

/**
 * Removes hash from filename for comparison
 *
 * @param {string} buildFolder - The build output folder
 * @param {string} fileName - The file name
 * @returns {string} The filename without hash
 */
function removeFileNameHash(buildFolder, fileName) {
  return fileName
    .replace(buildFolder, "")
    .replace(/\\/g, "/")
    .replace(
      /\/?(.*)(\.[0-9a-f]+)(\.chunk)?(\.js|\.css)/,
      (match, p1, p2, p3, p4) => p1 + p4
    );
}

/**
 * Gets a colored difference label for size comparison
 *
 * @param {number} currentSize - Current file size
 * @param {number} previousSize - Previous file size
 * @returns {string} Formatted difference label
 */
function getDifferenceLabel(currentSize, previousSize) {
  const FIFTY_KILOBYTES = 1024 * 50;
  const difference = currentSize - previousSize;
  const fileSizeStr = !Number.isNaN(difference) ? filesize(difference) : 0;

  if (difference >= FIFTY_KILOBYTES) {
    return chalk.red("+" + fileSizeStr);
  } else if (difference < FIFTY_KILOBYTES && difference > 0) {
    return chalk.yellow("+" + fileSizeStr);
  } else if (difference < 0) {
    return chalk.green(fileSizeStr);
  } else {
    return "";
  }
}

/**
 * Measures file sizes in a build directory before building
 *
 * @param {string} buildFolder - The build output directory
 * @returns {Promise<Object>} Object containing root path and size map
 */
async function measureFileSizesBeforeBuild(buildFolder) {
  const sizes = {};

  if (!fs.existsSync(buildFolder)) {
    return { root: buildFolder, sizes };
  }

  const files = await fs.readdir(buildFolder, { recursive: true });

  for (const file of files) {
    const filePath = path.join(buildFolder, file);
    const stats = await fs.stat(filePath);

    if (stats.isFile() && canReadAsset(file)) {
      const contents = await fs.readFile(filePath);
      const size = gzipSize(contents);
      const key = removeFileNameHash(buildFolder, file);
      sizes[key] = size;
    }
  }

  return { root: buildFolder, sizes };
}

/**
 * Prints detailed file size report after build
 *
 * @param {string} buildFolder - The build output directory
 * @param {Object} previousSizeMap - Previous size measurements
 * @param {number} maxBundleGzipSize - Max bundle size before warning
 * @param {number} maxChunkGzipSize - Max chunk size before warning
 */
async function printFileSizesAfterBuild(
  buildFolder,
  previousSizeMap = { root: buildFolder, sizes: {} },
  maxBundleGzipSize = WARN_AFTER_BUNDLE_GZIP_SIZE,
  maxChunkGzipSize = WARN_AFTER_CHUNK_GZIP_SIZE
) {
  const root = previousSizeMap.root;
  const sizes = previousSizeMap.sizes;
  const assets = [];

  if (!fs.existsSync(buildFolder)) {
    log(chalk.yellow("Build folder not found for size reporting"));
    return;
  }

  // Read all files in build directory
  const files = await fs.readdir(buildFolder, { recursive: true });

  for (const file of files) {
    const filePath = path.join(buildFolder, file);
    const stats = await fs.stat(filePath);

    if (stats.isFile() && canReadAsset(file)) {
      const fileContents = await fs.readFile(filePath);
      const size = gzipSize(fileContents);
      const previousSize = sizes[removeFileNameHash(root, file)] || 0;
      const difference = getDifferenceLabel(size, previousSize);

      assets.push({
        folder: path.join(path.basename(buildFolder), path.dirname(file)),
        name: path.basename(file),
        size: size,
        sizeLabel: filesize(size) + (difference ? " (" + difference + ")" : ""),
      });
    }
  }

  // Sort by size descending
  assets.sort((a, b) => b.size - a.size);

  // Calculate padding for alignment
  const longestSizeLabelLength = Math.max(
    ...assets.map((a) => stripAnsi(a.sizeLabel).length),
    0
  );

  let suggestBundleSplitting = false;

  // Print each asset
  assets.forEach((asset) => {
    let sizeLabel = asset.sizeLabel;
    const sizeLength = stripAnsi(sizeLabel).length;

    if (sizeLength < longestSizeLabelLength) {
      const rightPadding = " ".repeat(longestSizeLabelLength - sizeLength);
      sizeLabel += rightPadding;
    }

    const isMainBundle =
      asset.name.indexOf("main.") === 0 || asset.name.indexOf("index.") === 0;
    const maxRecommendedSize = isMainBundle
      ? maxBundleGzipSize
      : maxChunkGzipSize;
    const isLarge = maxRecommendedSize && asset.size > maxRecommendedSize;

    if (isLarge && path.extname(asset.name) === ".js") {
      suggestBundleSplitting = true;
    }

    log(
      "  " +
        (isLarge ? chalk.yellow(sizeLabel) : sizeLabel) +
        "  " +
        chalk.dim(asset.folder + path.sep) +
        chalk.cyan(asset.name)
    );
  });

  if (suggestBundleSplitting) {
    log(" ");
    log(
      chalk.yellow("The bundle size is significantly larger than recommended.")
    );
    log(
      chalk.yellow(
        "Consider reducing it with code splitting: https://goo.gl/9VhYWB"
      )
    );
    log(
      chalk.yellow(
        "You can also analyze the project dependencies: https://goo.gl/LeUzfb"
      )
    );
  }
}

module.exports = {
  measureFileSizesBeforeBuild,
  printFileSizesAfterBuild,
  WARN_AFTER_BUNDLE_GZIP_SIZE,
  WARN_AFTER_CHUNK_GZIP_SIZE,
};
