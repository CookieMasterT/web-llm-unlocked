import fs from "fs";
import path from "path";

function cleanupFile(filePath, isMap = false) {
  if (!fs.existsSync(filePath)) {
    return;
  }
  let content = fs.readFileSync(filePath, "utf8");

  // 1. Remove instances of string "const{createRequire:createRequire}=await import('module');"
  content = content.replaceAll(
    "const{createRequire:createRequire}=await import('module');",
    "",
  );

  // 2. Replace scriptDirectory init
  if (!isMap) {
    content = content.replaceAll(
      'require("url").fileURLToPath(new URL("./",import.meta.url))',
      '"./"',
    );
  } else {
    content = content.replaceAll(
      'require("url").fileURLToPath(new URL("./",import.meta.url))',
      '".\\"',
    );
  }

  // 3. Replace require URL dummy path
  if (!isMap) {
    content = content.replaceAll(
      "new (require('u' + 'rl').URL)('file:' + __filename).href",
      '"MLC_DUMMY_PATH"',
    );
    content = content.replace(
      /require\('u' \+ 'rl'\)\.pathToFileURL\(__filename\)\.href/g,
      '"MLC_DUMMY_PATH"',
    );
  } else {
    content = content.replaceAll(
      "new (require('u' + 'rl').URL)('file:' + __filename).href",
      '"MLC_DUMMY_PATH"',
    );
    content = content.replace(
      /require\('u' \+ 'rl'\)\.pathToFileURL\(__filename\)\.href/g,
      '"MLC_DUMMY_PATH"',
    );
  }

  // 4. Replace perf_hooks import/require
  if (!isMap) {
    content = content.replace(
      /import (require\$\$[0-9]+) from 'perf_hooks';/g,
      'const $1 = "MLC_DUMMY_REQUIRE_VAR"',
    );
  } else {
    content = content.replaceAll(
      'require("perf_hooks")',
      '"MLC_DUMMY_REQUIRE_VAR"',
    );
  }

  // 5. Replace ws import/require
  if (!isMap) {
    content = content.replace(
      /import (require\$\$[0-9]+) from 'ws';/g,
      'const $1 = "MLC_DUMMY_REQUIRE_VAR"',
    );
  } else {
    content = content.replaceAll('require("ws")', '"MLC_DUMMY_REQUIRE_VAR"');
  }

  fs.writeFileSync(filePath, content, "utf8");
}

const libDir = path.resolve("lib");
cleanupFile(path.join(libDir, "index.js"), false);
cleanupFile(path.join(libDir, "index.js.map"), true);
console.log("Cleanup completed successfully via cleanup-index-js.js");
