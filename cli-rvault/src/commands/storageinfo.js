import ora from "ora";
import chalk from "chalk";
import { storageBanner } from "../../utils/banners.js";
import { getStorageInfo } from "../services/fileServices.js";
import { isLoggedIn } from "../../utils/config.js";

// ─── layout ───────────────────────────────────────────────────────────────────
//
//  Full row = 44 visible chars:
//  "  │" (3) + content (40) + "│" (1) = 44
//
//  BAR row content (40):
//  " " + bar(32) + " " + pct(6) + " " = 40  → BAR_WIDTH = 32
//
const CONTENT_W = 40;
const BAR_WIDTH = 32;

const rpad = (s, len) => s + " ".repeat(Math.max(0, len - s.length));

// ─── bar ──────────────────────────────────────────────────────────────────────
const buildBar = (percent) => {
    const filled = Math.round((percent / 100) * BAR_WIDTH);
    const empty = BAR_WIDTH - filled;

    const color =
        percent > 80 ? chalk.red :
            percent > 50 ? chalk.yellow :
                chalk.cyan;

    // filled = bright blocks, empty = dim dots — both visible on dark bg
    return color("█".repeat(Math.max(0, filled))) +
        chalk.gray("·".repeat(Math.max(0, empty)));
};

// ─── row builders ─────────────────────────────────────────────────────────────

// Full-width label+value row:  "  │  LABEL        VALUE  │"
const labelRow = (label, value, valueRaw) => {
    // content = " " + label + gap + value + " " = 40
    // label area = 8, gap fills the middle
    const labelStr = chalk.gray(rpad(label, 8));
    const gap = " ".repeat(Math.max(1, CONTENT_W - 2 - 8 - valueRaw.length));
    return chalk.cyan("  │") + " " + labelStr + gap + value + " " + chalk.cyan("│");
};

// Section header row:  "  │  ── TITLE ──────────────────────────────  │"
const headerRow = (title) => {
    const inner = ` ${title} `;
    const dashes = "─".repeat(Math.max(0, CONTENT_W - 2 - inner.length));
    return chalk.cyan("  │") + " " + chalk.gray(inner + dashes) + " " + chalk.cyan("│");
};

// Bar row
const barRow = (percent) => {
    const pctStr = rpad(`${percent}%`, 6);
    return (
        chalk.cyan("  │") +
        " " + buildBar(percent) +
        " " + chalk.gray(pctStr) +
        " " + chalk.cyan("│")
    );
};

// Dividers
const top = () => chalk.cyan("  ╭" + "─".repeat(CONTENT_W) + "╮");
const mid = () => chalk.cyan("  ├" + "─".repeat(CONTENT_W) + "┤");
const bot = () => chalk.cyan("  ╰" + "─".repeat(CONTENT_W) + "╯");

// ─── status label ─────────────────────────────────────────────────────────────
const statusLabel = (percent) => {
    if (percent > 90) return chalk.red("  ✖  Critical — vault almost full");
    if (percent > 75) return chalk.yellow("  ⚠  Warning — storage running low");
    if (percent > 40) return chalk.yellow("  ●  Moderate usage");
    return chalk.green("  ✔  Storage healthy");
};

// ─── command ──────────────────────────────────────────────────────────────────
export const storageinfo = async () => {
    console.log(storageBanner);

    if (!isLoggedIn()) {
        console.log(chalk.yellow("  ⚠  You must be logged in to view storage info."));
        console.log(chalk.gray("  Run ") + chalk.cyan("rvault login"));
        console.log();
        return process.exit(1);
    }

    const spinner = ora({
        text: chalk.gray("  Fetching storage details..."),
        spinner: "dots",
    }).start();

    try {
        const data = await getStorageInfo();
        spinner.stop();

        const storageData = data.storage || data;
        const usedBytes = storageData.storageUsed || storageData.used || storageData.storage_used || 0;
        const limitBytes = storageData.storageLimit || storageData.limit || storageData.storage_limit || 5368709120;
        const freeBytes = Math.max(0, limitBytes - usedBytes);

        // ── computed values ───────────────────────────────────────────────────
        const usedMB = (usedBytes / 1024 / 1024).toFixed(2);
        const freeMB = (freeBytes / 1024 / 1024).toFixed(2);
        const limitGB = (limitBytes / 1024 / 1024 / 1024).toFixed(0);
        const percent = parseFloat(((usedBytes / Math.max(1, limitBytes)) * 100).toFixed(1));

        // plain strings for length counting
        const usedRaw = `${usedMB} MB`;
        const freeRaw = `${freeMB} MB`;
        const totalRaw = `${limitGB} GB`;

        // coloured strings
        const usedVal = chalk.white(`${usedMB} MB`);
        const freeVal = chalk.green(`${freeMB} MB`);
        const totalVal = chalk.cyan(`${limitGB} GB`);

        // ── render ────────────────────────────────────────────────────────────
        console.log(top());
        console.log(headerRow("storage usage"));
        console.log(mid());
        console.log(labelRow("used", usedVal, usedRaw));
        console.log(labelRow("free", freeVal, freeRaw));
        console.log(labelRow("total", totalVal, totalRaw));
        console.log(mid());
        console.log(barRow(percent));
        console.log(bot());
        console.log();
        console.log(statusLabel(percent));
        console.log();

    } catch (error) {
        spinner.fail(chalk.red("  Failed to load storage info."));
        console.log(chalk.red("  " + error.message));
        console.log();
        process.exit(1);
    }
};