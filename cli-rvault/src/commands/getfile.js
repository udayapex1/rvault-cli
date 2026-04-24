import fs from "fs";
import path from "path";
import stream from "stream";
import { promisify } from "util";
import axios from "axios";
import ora from "ora";
import chalk from "chalk";
import select from "@inquirer/select";
import { downloadBanner } from "../../utils/banners.js";
import { getUploads, getDownloadLink } from "../services/fileServices.js";
import { isLoggedIn } from "../../utils/config.js";

const finished = promisify(stream.finished);

export const getfile = async () => {
    console.log(downloadBanner);

    if (!isLoggedIn()) {
        console.log(chalk.yellow("  ⚠  You must be logged in to download files."));
        console.log(chalk.gray("  Run ") + chalk.cyan("rvault login"));
        console.log();
        return process.exit(1);
    }

    // ── destination hint ──────────────────────────────────────────────────────
    const cwd = process.cwd();
    console.log(chalk.cyan("  │"));
    console.log(
        chalk.cyan("  │") + "  " +
        chalk.gray("Saving to  ") +
        chalk.cyan(cwd)
    );
    console.log(
        chalk.cyan("  │") + "  " +
        chalk.gray("Run from a different directory to change destination")
    );
    console.log(chalk.cyan("  │"));
    console.log();

    // ── load file list ────────────────────────────────────────────────────────
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

    // ── empty vault ───────────────────────────────────────────────────────────
    if (files.length === 0) {
        console.log(chalk.cyan("  │") + "  " + chalk.yellow("⚠  No files found in your vault."));
        console.log(chalk.cyan("  │") + "  " + chalk.gray("Upload something first with ") + chalk.cyan("rvault upload"));
        console.log(chalk.cyan("  │"));
        console.log();
        return;
    }

    // ── file picker ───────────────────────────────────────────────────────────
    let selectedFile;
    try {
        selectedFile = await select({
            message: "Select a file to download",
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
        // user hit Ctrl+C
        console.log();
        console.log(chalk.gray("  Cancelled."));
        console.log();
        return;
    }

    console.log();

    // ── download ──────────────────────────────────────────────────────────────
    const fetchSpinner = ora({
        text: chalk.gray("  Generating secure download link..."),
        spinner: "dots",
    }).start();

    try {
        const linkData = await getDownloadLink(selectedFile._id);
        const { downloadUrl, fileName } = linkData;

        const fallbackName =
            fileName ||
            selectedFile.filename ||
            selectedFile.originalName ||
            "downloaded-file";

        const outputPath = path.resolve(cwd, fallbackName);

        fetchSpinner.text =
            chalk.gray("  Downloading ") +
            chalk.white(fallbackName) +
            chalk.gray("...");

        const dlResponse = await axios({
            method: "GET",
            url: downloadUrl,
            responseType: "stream",
        });

        const writer = fs.createWriteStream(outputPath);
        dlResponse.data.pipe(writer);
        await finished(writer);

        fetchSpinner.succeed(chalk.green("  Download complete!"));
        console.log();
        console.log(chalk.cyan("  │") + "  " + chalk.gray("File  ") + chalk.white(fallbackName));
        console.log(chalk.cyan("  │") + "  " + chalk.gray("Path  ") + chalk.cyan(outputPath));
        console.log(chalk.cyan("  │"));
        console.log();

    } catch (error) {
        fetchSpinner.fail(chalk.red("  Download failed."));
        console.log(chalk.red("  " + error.message));
        console.log();
        process.exit(1);
    }
};