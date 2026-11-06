import { runTestCommand } from "./runTestCommand";

const controller = new AbortController();
const cancel = () => controller.abort();
process.on("SIGINT", cancel);
process.on("SIGTERM", cancel);
try {
  await runTestCommand(process.argv.slice(2), { stdio: "inherit", cancelSignal: controller.signal });
} finally {
  process.removeListener("SIGINT", cancel);
  process.removeListener("SIGTERM", cancel);
}
