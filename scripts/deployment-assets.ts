import { readFile } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";
import ts from "typescript";

export interface AssetAuditOptions {
  directory: string;
  deploymentUrl: string;
  obsoleteBases: readonly string[];
}
export interface AssetAuditResult {
  deploymentUrl: string;
  checked: string[];
  failures: string[];
}

/** Inspect references emitted by the bundler, including imports in lazy chunks. */
export function assetReferences(source: string, extension: string): string[] {
  const references = new Set<string>();
  const add = (value: string | undefined) => { if (value && !/^(data:|blob:|#)/i.test(value)) references.add(value); };
  if (extension === "html") {
    for (const match of source.matchAll(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi)) add(match[1]);
    for (const match of source.matchAll(/<link\b[^>]*>/gi)) {
      if (/\brel\s*=\s*["'](?:stylesheet|modulepreload|preload|icon|apple-touch-icon)["']/i.test(match[0])) add(/\bhref\s*=\s*["']([^"']+)["']/i.exec(match[0])?.[1]);
    }
  }
  if (extension === "js" || extension === "mjs") {
    // Parse syntax so examples in strings/comments cannot become phantom imports.
    const file = ts.createSourceFile("asset.js", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    const visit = (node: ts.Node): void => {
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteralLike(node.moduleSpecifier)) add(node.moduleSpecifier.text);
      if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && node.arguments[0] && ts.isStringLiteralLike(node.arguments[0])) add(node.arguments[0].text);
      if (ts.isNewExpression(node) && node.expression.getText(file) === "URL" && node.arguments?.[0] && ts.isStringLiteralLike(node.arguments[0]) && node.arguments[1]?.getText(file) === "import.meta.url") add(node.arguments[0].text);
      // Vite's dependency map and emitted static asset URLs use string literals.
      if (ts.isStringLiteralLike(node) && !(ts.isPropertyAssignment(node.parent) && node.parent.name === node)
        && /^(?:\.?\.?\/|assets\/).+\.(?:js|mjs|css|png|jpe?g|webp|svg|woff2?|glb|gltf|ogg|mp3|wav)(?:[?#].*)?$/.test(node.text)) add(node.text);
      ts.forEachChild(node, visit);
    };
    visit(file);
  }
  if (extension === "css") {
    for (const match of source.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)|@import\s+["']([^"']+)["']/g)) add(match[1] ?? match[2]);
  }
  return [...references];
}

export async function auditBuildAssets(options: AssetAuditOptions): Promise<AssetAuditResult> {
  const base = new URL(options.deploymentUrl);
  if (!base.pathname.endsWith("/")) throw new Error("Deployment URL must end in a slash");
  const root = resolve(options.directory);
  const queue = [new URL("index.html", base)];
  const seen = new Set<string>();
  const result: AssetAuditResult = { deploymentUrl: base.href, checked: [], failures: [] };
  while (queue.length) {
    const url = queue.shift()!;
    url.hash = ""; url.search = "";
    if (seen.has(url.href)) continue;
    seen.add(url.href);
    if (url.origin !== base.origin) continue;
    if (!url.pathname.startsWith(base.pathname)) {
      result.failures.push(`Asset outside deployment path: ${url.href}`);
      continue;
    }
    let file: string;
    try { file = resolve(root, decodeURIComponent(url.pathname.slice(base.pathname.length))); }
    catch { result.failures.push(`Invalid asset path: ${url.href}`); continue; }
    const child = relative(root, file);
    if (child === ".." || child.startsWith(`..${sep}`) || resolve(file) === root) {
      result.failures.push(`Asset escapes build directory: ${url.href}`); continue;
    }
    let bytes: Buffer;
    try { bytes = await readFile(file); }
    catch { result.failures.push(`Missing emitted asset: ${url.href}`); continue; }
    result.checked.push(url.href);
    const extension = url.pathname.split(".").at(-1) ?? "";
    if (!["html", "js", "mjs", "css"].includes(extension)) continue;
    const source = bytes.toString("utf8");
    for (const oldBase of options.obsoleteBases) {
      if (source.includes(`${oldBase}assets/`)) result.failures.push(`Obsolete asset prefix ${oldBase} in ${url.href}`);
    }
    for (const reference of assetReferences(source, extension)) {
      try {
        // Vite dependency-map entries are relative to the document, unlike imports.
        const from = extension === "js" && reference.startsWith("assets/") ? base : url;
        queue.push(new URL(reference, from));
      } catch { result.failures.push(`Invalid asset reference ${reference} in ${url.href}`); }
    }
  }
  return result;
}

