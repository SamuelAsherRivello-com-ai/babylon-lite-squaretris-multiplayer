# Skills-library duplicate resolution

The clean library revision `f3700fdd4fab4cde2047a99a305ae3ac57e3d0c5` contains two different directories whose frontmatter names are both `ai-skills-project-run-start`:

- `.agents/skills/ai-skills-run/ai-skills-project-run-start` has the maintained launcher: twenty-port scanning, loopback binding, captured diagnostics, optional HMR disabling and verified page titles.
- `.agents/skills/ai-skills-library/ai-skills-project-run-start` contains an older launcher and unrelated BIS example names.

Import the maintained `ai-skills-run` directory verbatim as the single active skill. Preserve the older directory verbatim under `docs/skill-source-notices/library-duplicates/ai-skills-project-run-start/ai-skills-library`, outside skill discovery, and record both file manifests in `docs/skills-import.json`. Do not modify the library checkout, global skills, or either source variant. Any other conflicting duplicate still fails import for explicit reconciliation.

This corrects the earlier assumption that the duplicate directories were identical. The read-only preflight found the difference before template bootstrap or active skill installation.
