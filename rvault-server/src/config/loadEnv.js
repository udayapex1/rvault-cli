import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFromRoot = path.resolve(process.cwd(), ".env");
const envFromSrc = path.resolve(__dirname, "../.env");
const dotenvPath = fs.existsSync(envFromRoot) ? envFromRoot : envFromSrc;

dotenv.config({ path: dotenvPath });
