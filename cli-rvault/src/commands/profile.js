import ora from "ora";
import chalk from "chalk";
import { profileBanner } from "../../utils/banners.js";
import { getProfile } from "../services/authServices.js";
import { isLoggedIn } from "../../utils/config.js";

// ─── layout constants ─────────────────────────────────────────────────────────
//
//  Full row (40 visible chars):
//  "  │" + [36 chars of content] + "│"
//   3         36                    1   = 40
//
//  Content layout (36 chars):
//  " " + label(5) + " │ " + value+pad + " "
//   1      5         3      BOX_VAL_W    1   = 36  →  BOX_VAL_W = 26
//
//  Bar row content (36 chars):
//  " " + "     " + " │ " + bar(BAR_WIDTH) + " " + pct(5) + " "
//   1       5        3        BAR_WIDTH      1      5       1  = 36  →  BAR_WIDTH = 20
//
const CONTENT_W = 36; // chars between outer │ walls
const LABEL_W = 5;  // right-aligned label field
const VAL_W = 26; // value + right-padding  (1+LABEL_W+3 = 9 overhead, 36-9-1 = 26)
const BAR_WIDTH = 20; // ── verified: 1+5+3+20+1+5+1 = 36 ✓

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Pad a PLAIN string on the right to exactly `len` visible chars */
const rpad = (s, len) => s + " ".repeat(Math.max(0, len - s.length));

/** Left-pad a PLAIN string to `len` visible chars */
const lpad = (s, len) => " ".repeat(Math.max(0, len - s.length)) + s;

/**
 * Progress bar — uses single-column Unicode block chars.
 * ██░░  filled=cyan/yellow/red  empty=gray
 */
const buildBar = (percent) => {
    const filled = Math.round((percent / 100) * BAR_WIDTH);
    const empty = BAR_WIDTH - filled;
    const color =
        percent > 80 ? chalk.red :
            percent > 50 ? chalk.yellow :
                chalk.cyan;
    return color("█".repeat(filled)) + chalk.gray("░".repeat(empty));
};

/**
 * One data row.
 *   label  – plain string, shown right-aligned in LABEL_W chars
 *   value  – chalk-coloured string to display
 *   rawLen – visible length of value (no chalk escape bytes)
 *
 *  "  │ " + label(5) + " │ " + value + pad + " │"
 *    3   1    5       3        rawLen  pad  1  1
 */
const dataRow = (label, value, rawLen) => {
    const pad = " ".repeat(Math.max(0, VAL_W - rawLen));
    return (
        chalk.cyan("  │") +
        " " + chalk.gray(lpad(label, LABEL_W)) +
        " " + chalk.cyan("│") +
        " " + value + pad +
        " " + chalk.cyan("│")
    );
};

/** Horizontal divider using box-drawing chars */
const divider = (l, m, r) =>
    chalk.cyan("  " + l + "─".repeat(CONTENT_W) + r);

// ─── command ──────────────────────────────────────────────────────────────────
export const profile = async () => {
    console.log(profileBanner);

    if (!isLoggedIn()) {
        console.log(chalk.yellow("  ⚠  You must be logged in to view your profile."));
        console.log(chalk.gray("  Run ") + chalk.cyan("rvault login"));
        console.log();
        return process.exit(1);
    }

    const spinner = ora({
        text: chalk.gray("  Fetching profile..."),
        spinner: "dots",
    }).start();

    try {
        const user = await getProfile();
        spinner.succeed(chalk.green("  Profile fetched successfully!"));
        console.log();

        // ── storage ───────────────────────────────────────────────────────────
        const usedBytes = user.storageUsed || 0;
        const limitBytes = user.storageLimit || 5368709120;
        const usedMB = (usedBytes / 1024 / 1024).toFixed(2);
        const limitGB = (limitBytes / 1024 / 1024 / 1024).toFixed(0);
        const percent = parseFloat(((usedBytes / limitBytes) * 100).toFixed(1));

        // ── plain strings (for length) ────────────────────────────────────────
        const nameRaw = user.name || "N/A";
        const usernameRaw = `@${user.username || "N/A"}`;
        const emailRaw = user.email || "N/A";
        const usedRaw = `${usedMB} MB of ${limitGB} GB`;
        const pctRaw = `${percent}%`;

        // ── coloured strings ──────────────────────────────────────────────────
        const nameVal = chalk.white(nameRaw);
        const usernameVal = chalk.cyan(usernameRaw);
        const emailVal = chalk.white(emailRaw);
        const usedVal = chalk.white(`${usedMB} MB`) + chalk.gray(` of ${limitGB} GB`);

        // ── bar row ───────────────────────────────────────────────────────────
        //  "  │" + " " + "     " + " │ " + bar(20) + " " + pct(5) + " " + "│"
        //    3      1      5        3       20        1     5        1     1   = 40 ✓
        const barRow =
            chalk.cyan("  │") +
            " " + " ".repeat(LABEL_W) +
            " " + chalk.cyan("│") +
            " " + buildBar(percent) +
            " " + chalk.gray(rpad(pctRaw, 5)) +
            " " + chalk.cyan("│");

        // ── render ────────────────────────────────────────────────────────────
        console.log(divider("╭", "", "╮"));
        console.log(dataRow("name", nameVal, nameRaw.length));
        console.log(dataRow("userN", usernameVal, usernameRaw.length));
        console.log(dataRow("email", emailVal, emailRaw.length));
        console.log(divider("├", "", "┤"));
        console.log(dataRow("used", usedVal, usedRaw.length));
        console.log(barRow);
        console.log(divider("╰", "", "╯"));
        console.log();

    } catch (error) {
        spinner.fail(chalk.red("  Failed to load profile."));
        console.log(chalk.red("  " + error.message));
        console.log();
        process.exit(1);
    }
};