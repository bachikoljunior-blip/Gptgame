import assert from "node:assert/strict";
import crypto from "node:crypto";

const artifactPattern = /<meta name="artifact-revision" content="([0-9a-f]{64}|__ARTIFACT_REVISION__)">/i;
const legacyPattern = /<meta name="git-revision" content="(?:[0-9a-f]{40}|__GIT_REVISION__)">/i;
const placeholder = "__ARTIFACT_REVISION__";

export function normalizeArtifactSource(source, options = {}) {
  let normalized = String(source);
  const artifactMatches = normalized.match(new RegExp(artifactPattern.source, "ig")) || [];
  const legacyMatches = normalized.match(new RegExp(legacyPattern.source, "ig")) || [];

  if (artifactMatches.length === 0 && legacyMatches.length === 1 && options.allowLegacy) {
    normalized = normalized.replace(
      legacyPattern,
      '<meta name="artifact-revision" content="' + placeholder + '">',
    );
  } else {
    assert.equal(legacyMatches.length, 0, "legacy git-revision metadata is not allowed");
    assert.equal(artifactMatches.length, 1, "source must contain exactly one artifact-revision meta tag");
    normalized = normalized.replace(
      artifactPattern,
      '<meta name="artifact-revision" content="' + placeholder + '">',
    );
  }

  return normalized;
}

export function computeArtifactRevision(source, options = {}) {
  return crypto.createHash("sha256").update(normalizeArtifactSource(source, options)).digest("hex");
}

export function stampArtifactRevision(source, options = {}) {
  const normalized = normalizeArtifactSource(source, options);
  const revision = crypto.createHash("sha256").update(normalized).digest("hex");
  return {
    revision,
    source: normalized.replace(placeholder, revision),
  };
}

export function verifyArtifactRevision(source) {
  const match = String(source).match(artifactPattern);
  assert.ok(match, "artifact-revision metadata is missing");
  assert.match(match[1], /^[0-9a-f]{64}$/i, "artifact revision must be a SHA-256 digest");
  const expected = computeArtifactRevision(source);
  assert.equal(match[1].toLowerCase(), expected, "embedded artifact revision does not match the HTML content");
  return expected;
}
