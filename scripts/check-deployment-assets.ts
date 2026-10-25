import { auditBuildAssets } from "./deployment-assets.ts";
const result = await auditBuildAssets({ directory: "tetris/dist", deploymentUrl: "https://samuelasherrivello-com-ai.github.io/babylon-lite-squaretris-multiplayer/", obsoleteBases: ["/babylon-lite-tetris-multiplayer-clone/"] });
if (result.failures.length) throw new Error(result.failures.join("\n"));
console.log("Production asset paths checked:", result.checked.length);
