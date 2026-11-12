import { tmpdir } from "node:os";
import path from "node:path";

export function sqliteDatabasePath(
  environment: NodeJS.ProcessEnv = process.env,
  workingDirectory = process.cwd(),
  temporaryDirectory = tmpdir()
) {
  const directory = environment.GEMOIRE_DATA_DIR?.trim() || (
    environment.VERCEL === "1"
      ? path.join(temporaryDirectory, "gemoire-jewels")
      : path.join(workingDirectory, "data")
  );

  return path.resolve(workingDirectory, directory, "gemoire-admin.db");
}
