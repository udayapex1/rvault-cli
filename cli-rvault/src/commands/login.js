import inquirer from "inquirer";
import ora from "ora";
import chalk from "chalk";
import { loginBanner } from "../../utils/banners.js";
import * as authServices from "../services/authServices.js";
import { saveToken, saveUser, isLoggedIn, getUser } from "../../utils/config.js";

export const login = async () => {
    console.log(loginBanner);

    // ─── Already logged in? ───────────────────────────────────
    if (isLoggedIn()) {
        const existing = getUser();
        console.log(
            chalk.yellow("  ⚠  You are already logged in as ") +
            chalk.cyan(`@${existing?.username ?? existing?.email}`)
        );
        console.log(chalk.gray("  Run ") + chalk.cyan("rvault logout") + chalk.gray(" to switch accounts."));
        console.log();
        return;
    }

    // ─── Collect credentials ──────────────────────────────────
    const { email, password } = await inquirer.prompt([
        {
            type: "input",
            name: "email",
            message: chalk.gray("  Email:"),
            validate: (v) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(v) || "Please enter a valid email address";
            },
        },
        {
            type: "password",
            name: "password",
            message: chalk.gray("  Password:"),
            mask: "●",
            validate: (v) => v.length >= 8 || "Min 8 characters",
        },
    ]);

    // ─── TOTP prompt ──────────────────────────────────────────
    console.log();
    console.log(chalk.cyan("  ┌─────────────────────────────────────────┐"));
    console.log(chalk.cyan("  │") + chalk.yellow.bold("  2FA Verification                       ") + chalk.cyan("│"));
    console.log(chalk.cyan("  │") + chalk.gray("  Open Google Authenticator for rvault   ") + chalk.cyan("│"));
    console.log(chalk.cyan("  └─────────────────────────────────────────┘"));
    console.log();

    const { totpToken } = await inquirer.prompt([
        {
            type: "input",
            name: "totpToken",
            message: chalk.gray("  6-digit authenticator code:"),
            validate: (v) => /^\d{6}$/.test(v) || "Enter a valid 6-digit code",
        },
    ]);

    // ─── Call API ─────────────────────────────────────────────
    const spinner = ora({
        text: chalk.gray("  Authenticating..."),
        spinner: "dots",
    }).start();

    try {
        const res = await authServices.login({ email, password, totpToken });

        // Persist session
        saveToken(res.token);
        saveUser(res.user);

        spinner.succeed(chalk.green("  Logged in successfully!"));
        console.log();

        // ─── Welcome summary ──────────────────────────────────
        const user = res.user;
        const usedMB = ((user.storageUsed ?? 0) / 1024 / 1024).toFixed(2);
        const limitGB = ((user.storageLimit ?? 5368709120) / 1024 / 1024 / 1024).toFixed(0);

        console.log(chalk.cyan("  ────────────────────────────────────────"));
        console.log(
            chalk.gray("  Welcome, ") + chalk.white.bold(user.name ?? user.username)
        );
        console.log(
            chalk.gray("  Account  ") + chalk.cyan(`@${user.username}`)
        );
        console.log(
            chalk.gray("  Storage  ") +
            chalk.white(`${usedMB} MB used`) +
            chalk.gray(` / ${limitGB} GB`)
        );
        console.log(chalk.cyan("  ────────────────────────────────────────"));
        console.log();
    } catch (err) {
        spinner.fail(chalk.red("  " + (err.message || "Login failed")));
        console.log();

        const msg = (err.message || "").toLowerCase();

        if (msg.includes("not found")) {
            console.log(chalk.gray("  No account with that email. Try:") + chalk.cyan("  rvault register"));
        } else if (msg.includes("not verified") || msg.includes("email not verified")) {
            console.log(chalk.yellow("  ⚠  Your email is not verified. Check your inbox."));
        } else if (msg.includes("invalid credentials") || msg.includes("password")) {
            console.log(chalk.gray("  Double-check your password and try again."));
        } else if (msg.includes("authenticator") || msg.includes("totp") || msg.includes("code")) {
            console.log(chalk.yellow("  ⚠  TOTP code invalid or expired. Wait for the next code and retry."));
        }

        console.log();
        process.exit(1);
    }
};
