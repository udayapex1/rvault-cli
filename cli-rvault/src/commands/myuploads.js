import ora from "ora";
import chalk from "chalk";
import Table from "cli-table3";
import { lsBanner } from "../../utils/banners.js";
import { getUploads } from "../services/fileServices.js";
import { isLoggedIn } from "../../utils/config.js";

export const myuploads = async () => {
    console.log(lsBanner);

    if (!isLoggedIn()) {
        console.log(chalk.yellow("  ⚠  You must be logged in to view your files."));
        console.log(chalk.gray("  Run ") + chalk.cyan("rvault login"));
        console.log();
        return process.exit(1);
    }

    const spinner = ora({
        text: chalk.gray("  Fetching your files..."),
        spinner: "dots",
    }).start();

    try {
        const data = await getUploads(1, 20);
        spinner.stop();

        // Extract array form different possible structures depending on API format
        const files = Array.isArray(data) ? data : (data.files || data.data || data.uploads || []);

        if (files.length === 0) {
            console.log(chalk.cyan("  ┌─────────────────────────────────────────┐"));
            console.log(chalk.cyan("  │") + chalk.yellow.bold("  No files uploaded yet.                 ") + chalk.cyan("│"));
            console.log(chalk.cyan("  └─────────────────────────────────────────┘"));
            console.log(chalk.gray("  Use ") + chalk.cyan("rvault upload <file>") + chalk.gray(" to add a file."));
            console.log();
            return;
        }

        const table = new Table({
            head: [
                chalk.white("ID"),
                chalk.white("Filename"),
                chalk.white("Size"),
                chalk.white("Date"),
            ],
            chars: {
                'top': '─', 'top-mid': '┬', 'top-left': '╭', 'top-right': '╮',
                'bottom': '─', 'bottom-mid': '┴', 'bottom-left': '╰', 'bottom-right': '╯',
                'left': '│', 'left-mid': '├',
                'mid': '─', 'mid-mid': '┼',
                'right': '│', 'right-mid': '┤',
                'middle': '│'
            },
            style: {
                head: [],
                border: ['cyan']
            }
        });

        files.forEach((f) => {
            const sizeMB = f.size ? (f.size / 1024 / 1024).toFixed(2) + " MB" : (f.sizeBytes ? (f.sizeBytes / 1024 / 1024).toFixed(2) + " MB" : "-");
            const date = f.createdAt ? new Date(f.createdAt).toLocaleDateString() : "-";
            const id = f._id ? f._id.toString().slice(-6) : "-"; // only show last 6 chars of ID for aesthetics

            table.push([
                chalk.gray(id),
                chalk.cyan(f.filename || f.originalName || f.name || "-"),
                chalk.white(sizeMB),
                chalk.gray(date)
            ]);
        });

        console.log(table.toString());
        console.log();

    } catch (error) {
        spinner.fail(chalk.red("  Failed to fetch files."));
        console.log(chalk.red("  " + error.message));
        console.log();
        process.exit(1);
    }
};
