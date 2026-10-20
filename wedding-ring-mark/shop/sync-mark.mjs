// Brings Mark's designer in from his repo: copies src/ of BurrowsJewellers/ring-magic-studio at a commit into
// mark/src (replacing what is there) and records the commit in mark/COMMIT. His files are never edited here.
//   npm run sync               -> the commit in mark/COMMIT (to restore it)
//   npm run sync -- main       -> his latest
//   npm run sync -- <sha>      -> that commit
// Then `npm run build`. If a patch in shop/patches.mjs no longer matches his code, the build stops and says which.
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const REPO = process.env.MARK_REPO || "https://github.com/BurrowsJewellers/ring-magic-studio.git";
const pinned = existsSync(path.join(here, "mark", "COMMIT")) ? readFileSync(path.join(here, "mark", "COMMIT"), "utf8").trim() : "main";
const want = process.argv[2] || pinned;
const tmp = mkdtempSync(path.join(tmpdir(), "ring-magic-studio-"));
const git = (...a) => execFileSync("git", a, { cwd: tmp, stdio: ["ignore", "pipe", "inherit"] }).toString().trim();
try {
  execFileSync("git", ["clone", "--quiet", REPO, tmp], { stdio: "inherit" });
  git("checkout", "--quiet", want);
  const sha = git("rev-parse", "HEAD");
  rmSync(path.join(here, "mark", "src"), { recursive: true, force: true });
  cpSync(path.join(tmp, "src"), path.join(here, "mark", "src"), { recursive: true });
  writeFileSync(path.join(here, "mark", "COMMIT"), sha + "\n");
  console.log(`mark/src is now ring-magic-studio ${sha.slice(0, 7)} (${git("log", "-1", "--format=%cs %s")})`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
