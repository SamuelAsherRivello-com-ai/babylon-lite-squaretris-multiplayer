# Deployment asset paths

The official GitHub Pages deployment is https://samuelasherrivello-com-ai.github.io/babylon-lite-squaretris-multiplayer/. Keep the production Vite base matched to that path when renaming the repository. Keep the existing application root and workflow artifact directory.

Run npm test and npm run build from the repository root. Build checks the strict TypeScript configuration and follows emitted HTML, CSS and JavaScript asset references, including lazy imports. A missing local file or an obsolete repository asset prefix fails the build. Candordle's production base is selected with GITHUB_ACTIONS=true; its local development base remains /.

New configuration and verification tools are TypeScript. Unchanged legacy JavaScript game sources retain their existing test coverage; this repair does not claim a complete source migration.

After publication, verify the actual official page inside WGD. A successful build or loaded iframe does not prove interactive gameplay or a multiplayer session.
