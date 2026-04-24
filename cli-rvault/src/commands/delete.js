import ora from "ora";
import chalk from "chalk";
import select from "@inquirer/select";
import confirm from "@inquirer/confirm";
import { deleteBanner } from "../../utils/banners.js";
import { getUploads, deleteFile } from "../services/fileServices.js";
import { isLoggedIn } from "../../utils/config.js";

export const deleteCmd = async () => {
    console.log(deleteBanner);

    if (!isLoggedIn()) {
        console.log(chalk.yellow("  ⚠  You must be logged in to delete files."));
        console.log(chalk.gray("  Run ") + chalk.cyan("rvault login"));
        console.log();
        return process.exit(1);
    }

    const spinner = ora({
        text: chalk.gray("  Loading your vault..."),
        spinner: "dots",
    }).start();

    let files = [];

    try {
        const data = await getUploads(1, 100);
        files = Array.isArray(data)
            ? data
            : (data.files || data.data || data.uploads || []);
        spinner.stop();
    } catch (error) {
        spinner.fail(chalk.red("  Failed to load files."));
        console.log(chalk.red("  " + error.message));
        console.log();
        return process.exit(1);
    }

    if (files.length === 0) {
        console.log(chalk.cyan("  │") + "  " + chalk.yellow("⚠  No files found in your vault."));
        console.log(chalk.cyan("  │"));
        console.log();
        return;
    }

    // ── file picker ───────────────────────────────────────────────────────────
    let selectedFile;
    try {
        selectedFile = await select({
            message: "Select a file to PERMANENTLY delete",
            pageSize: 10,
            choices: files.map((f) => {
                const name = f.filename || f.originalName || f.name || "Unknown File";
                const bytes = f.size || f.sizeBytes || 0;
                const sizeMB = bytes
                    ? chalk.gray(` (${(bytes / 1024 / 1024).toFixed(2)} MB)`)
                    : "";

                return {
                    name: chalk.white(name) + sizeMB,
                    value: f,
                };
            }),
        });
    } catch {
        console.log();
        console.log(chalk.gray("  Cancelled."));
        console.log();
        return;
    }

    console.log();

    // ── confirmation ──────────────────────────────────────────────────────────
    const fallbackName = selectedFile.filename || selectedFile.originalName || "Unknown File";

    let isConfirmed = false;
    try {
        isConfirmed = await confirm({
            message: chalk.red(`Are you sure you want to delete `) + chalk.white.bold(fallbackName) + chalk.red(`?`),
            default: false
        });
    } catch {
        console.log();
        console.log(chalk.gray("  Cancelled."));
        console.log();
        return;
    }

    if (!isConfirmed) {
        console.log();
        console.log(chalk.gray("  Cancelled."));
        console.log();
        return;
    }

    console.log();

    // ── deletion ──────────────────────────────────────────────────────────────
    const delSpinner = ora({
        text: chalk.gray("  Deleting file..."),
        spinner: "dots"
    }).start();

    try {
        await deleteFile(selectedFile._id);

        delSpinner.succeed(chalk.green("  File deleted successfully!"));
        console.log();
        console.log(chalk.cyan("  │") + "  " + chalk.red.strikethrough(fallbackName));
        console.log(chalk.cyan("  │") + "  " + chalk.gray("Space recovered securely"));
        console.log(chalk.cyan("  │"));
        console.log();
    } catch (error) {
        delSpinner.fail(chalk.red("  Delete failed."));
        console.log(chalk.red("  " + error.message));
        console.log();
        process.exit(1);
    }
};
