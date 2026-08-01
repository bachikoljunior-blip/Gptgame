import fs from "node:fs";
import path from "node:path";
import { verifyArtifactRevision } from "./artifact-revision.mjs";

const input = path.resolve(process.argv[2] || "index.html");
const output = path.resolve(process.argv[3] || "_site/index.html");
const source = fs.readFileSync(input, "utf8");
const revision = verifyArtifactRevision(source);
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, source);
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, "revision=" + revision + "\n");
console.log("release prepared: " + revision);
