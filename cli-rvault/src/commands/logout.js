import chalk from "chalk";
import ora from "ora";
import { logoutBanner } from "../../utils/banners.js";
import { isLoggedIn, clearSession, getUser } from "../../utils/config.js";

export const logout = () => {
    console.log(logoutBanner);

    if (!isLoggedIn()) {
        console.log(chalk.yellow("  ⚠  You are not currently logged in."));
        console.log();
        return;
    }

    const user = getUser();
    const username = user?.username || user?.email || "User";

    const spinner = ora({ text: chalk.gray("  Logging out..."), spinner: "dots" }).start();

    try {
        clearSession();

        // Simulate a brief delay to make it feel deliberate
        setTimeout(() => {
            spinner.succeed(chalk.green("  Logged out successfully."));
            console.log();
            console.log(chalk.gray(`  Goodbye, `) + chalk.cyan(`@${username}`) + chalk.gray(`!`));
            console.log();
        }, 400);
    } catch (error) {
        spinner.fail(chalk.red("  Failed to logout."));
    }
};
