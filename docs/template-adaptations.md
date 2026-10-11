# Template adaptations

- Preserve GitHub's generated single `Initial commit` bootstrap commit, recording its SHA and one-commit history. The template asks for capitalization normalization to `Initial Commit`; the invoked repository-creation skill forbids force-pushing. Preserve the new remote history and document this capitalization-only adaptation instead of rewriting it. No project history is replaced.

These explicit changes specialize the repository template for the approved game. They preserve its four corner roles, repository links, gutters, version source, Babylon Lite renderer and configured pixel-grid wrapper.

- Replace the 32×32 rotating showcase and its white background with the original portrait duel. Remove unused showcase assets and code after integration.
- Use one 288×512 logical portrait surface. Remove the orientation control, shortcut and persisted override. Fit with a centered integer CSS scale whenever at least 1× fits; use a nonzero fractional fit below that threshold and document the reduced pixel guarantee.
- Keep render-resolution presets and accessible settings diagnostics. Replace the always-visible Babylon demonstration logo/readout and world-edge outline with game information and controls so the well remains readable.
- Opening a shell dialog neutralizes held input but leaves the renderer, subscription and server deadlines running. A local settings dialog cannot pause the opponent's match.
- Retain root commands and delivery workflows, renaming the implementation directory from `project-name` to `tetris` throughout relevant configuration.
- Use OpenSpec 1.14.0 rather than the template's stale 1.13.1 pin. Generate local workflow skills with the compatible generator and preserve the authored change and source provenance; do not hand-edit generated skills.
- Import library skills by their validated frontmatter names, deduplicating only identical directory contents. Preserve verbatim library OpenSpec workflows under `docs/skill-source-notices/library-openspec` before generation. For names managed by the compatible generator, use its generated active files and record their ownership explicitly; keep noncolliding library workflows active and retain all original source hashes. No global skill files change.

The `babylon-lite-content` delta records the replacement of accepted showcase and dialog-pause requirements. Pixel-grid entry-point enforcement, lifecycle cleanup, nearest sampling, single DPR accounting, unsupported-WebGPU recovery, corner roles and layout verification remain requirements.
