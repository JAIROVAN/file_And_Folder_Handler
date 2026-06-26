import { pathToFileURL } from "url";

export function isMain(importMetaUrl) {
  return Boolean(process.argv[1]) && importMetaUrl === pathToFileURL(process.argv[1]).href;
}

