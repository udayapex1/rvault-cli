import fs from "fs";
import path from "path";
import ora from "ora";
import chalk from "chalk";
import { uploadBanner } from "../../utils/banners.js";
import { uploadFile } from "../services/fileServices.js";
import { isLoggedIn } from "../../utils/config.js";

// Layout helpers
const CONTENT_W = 40;
const rpad = (s, len) => s + " ".repeat(Math.max(0, len - s.length));

const top = () => chalk.cyan("  ╭" + "─".repeat(CONTENT_W) + "╮");
const mid = () => chalk.cyan("  ├" + "─".repeat(CONTENT_W) + "┤");
const bot = () => chalk.cyan("  ╰" + "─".repeat(CONTENT_W) + "╯");

const headerRow = (title) => {
    const inner = ` ${title} `;
    const dashes = "─".repeat(Math.max(0, CONTENT_W - 2 - inner.length));
    return chalk.cyan("  │") + " " + chalk.gray(inner + dashes) + " " + chalk.cyan("│");
};

const labelRow = (label, valueRaw, valueStr) => {
    const labelStr = chalk.gray(rpad(label, 8));
    const gap = " ".repeat(Math.max(1, CONTENT_W - 2 - 8 - valueRaw.length));
    return chalk.cyan("  │") + " " + labelStr + gap + valueStr + " " + chalk.cyan("│");
};

export const upload = async (filePath) => {
    console.log(uploadBanner);

    if (!isLoggedIn()) {
        console.log(chalk.yellow("  ⚠  You must be logged in to upload files."));
        console.log(chalk.gray("  Run ") + chalk.cyan("rvault login"));
        console.log();
        return process.exit(1);
    }

    if (!filePath) {
        console.log(chalk.cyan("  │") + "  " + chalk.yellow("⚠  No file specified."));
        console.log(chalk.cyan("  │") + "  " + chalk.gray("Usage: ") + chalk.white("rvault upload <file>"));
        console.log(chalk.cyan("  │"));
        console.log();
        return process.exit(1);
    }

    const absolutePath = path.resolve(process.cwd(), filePath);

    if (!fs.existsSync(absolutePath)) {
        console.log(chalk.cyan("  │") + "  " + chalk.yellow(`⚠  File not found:`));
        console.log(chalk.cyan("  │") + "  " + chalk.gray(absolutePath));
        console.log(chalk.cyan("  │"));
        console.log();
        return process.exit(1);
    }

    const stats = fs.statSync(absolutePath);
    if (!stats.isFile()) {
        console.log(chalk.cyan("  │") + "  " + chalk.red(`✖  Path is not a regular file.`));
        console.log(chalk.cyan("  │"));
        console.log();
        return process.exit(1);
    }

    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

    if (stats.size > 50 * 1024 * 1024) {
        console.log(chalk.cyan("  │") + "  " + chalk.red(`✖  File size exceeds 50MB limit (${sizeMB} MB)`));
        console.log(chalk.cyan("  │"));
        console.log();
        return process.exit(1);
    }

    console.log(chalk.cyan("  │") + "  " + chalk.gray("Target   ") + chalk.white(path.basename(absolutePath)));
    console.log(chalk.cyan("  │") + "  " + chalk.gray("Size     ") + chalk.white(`${sizeMB} MB`));
    console.log(chalk.cyan("  │"));
    console.log();

    const spinner = ora({
        text: chalk.gray("  Encrypting & Uploading securely..."),
        spinner: "dots"
    }).start();

    try {
        const data = await uploadFile(absolutePath);
        spinner.succeed(chalk.green("  Upload complete!"));

        const f = data.file || {};
        const id = f.id || f._id || "N/A";
        const name = f.name || f.filename || path.basename(absolutePath);

        console.log();
        console.log(top());
        console.log(headerRow("transfer successful"));
        console.log(mid());
        console.log(labelRow("name", name, chalk.white(name)));
        console.log(labelRow("size", `${sizeMB} MB`, chalk.cyan(`${sizeMB} MB`)));
        console.log(labelRow("id", String(id), chalk.gray(id)));
        console.log(bot());
        console.log();

    } catch (error) {
        spinner.fail(chalk.red("  Upload failed."));
        console.log(chalk.red("  " + error.message));
        console.log();
        process.exit(1);
    }
};
