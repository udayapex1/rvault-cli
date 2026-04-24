import chalk from "chalk";

// ─────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────
export const mainBanner = `
${chalk.cyan("██████╗ ██╗   ██╗ █████╗ ██╗   ██╗██╗  ████████╗")}
${chalk.cyan("██╔══██╗██║   ██║██╔══██╗██║   ██║██║  ╚══██╔══╝")}
${chalk.cyan("██████╔╝██║   ██║███████║██║   ██║██║     ██║   ")}
${chalk.cyan("██╔══██╗╚██╗ ██╔╝██╔══██║██║   ██║██║     ██║   ")}
${chalk.cyan("██║  ██║ ╚████╔╝ ██║  ██║╚██████╔╝███████╗██║   ")}
${chalk.gray("╚═╝  ╚═╝  ╚═══╝  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝   ")}
${chalk.gray("  Remote File Vault — by")} ${chalk.cyan("@udayapex1")}
`;

// ─────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────
export const registerBanner = `
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.cyan("●")} ${chalk.yellow("●")} ${chalk.green("●")}
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.white.bold("rvault")} ${chalk.cyan("/")} ${chalk.gray("register")}
${chalk.cyan("  │")}   ${chalk.gray("Create your encrypted rvault account")}
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.gray("────────────────────────────────")}
${chalk.cyan("  │")}
`;

// ─────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────
export const loginBanner = `
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.cyan("●")} ${chalk.yellow("●")} ${chalk.green("●")}
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.white.bold("rvault")} ${chalk.cyan("/")} ${chalk.gray("login")}
${chalk.cyan("  │")}   ${chalk.gray("Access your encrypted vault")}
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.gray("────────────────────────────────")}
${chalk.cyan("  │")}
`;

// ─────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────
export const logoutBanner = `
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.cyan("●")} ${chalk.yellow("●")} ${chalk.green("●")}
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.white.bold("rvault")} ${chalk.cyan("/")} ${chalk.yellow("logout")}
${chalk.cyan("  │")}   ${chalk.gray("Clear your local session")}
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.gray("────────────────────────────────")}
${chalk.cyan("  │")}
`;

// ─────────────────────────────────────────
// UPLOAD
// ─────────────────────────────────────────
export const uploadBanner = `
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.cyan("●")} ${chalk.yellow("●")} ${chalk.green("●")}
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.white.bold("rvault")} ${chalk.cyan("/")} ${chalk.green("upload")}
${chalk.cyan("  │")}   ${chalk.gray("Uploading file to Backblaze B2")}
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.gray("────────────────────────────────")}
${chalk.cyan("  │")}
`;

// ─────────────────────────────────────────
// LS (List Files)
// ─────────────────────────────────────────
export const lsBanner = `
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.cyan("●")} ${chalk.yellow("●")} ${chalk.green("●")}
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.white.bold("rvault")} ${chalk.cyan("/")} ${chalk.cyan("ls")}
${chalk.cyan("  │")}   ${chalk.gray("Your files in the vault")}
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.gray("────────────────────────────────")}
${chalk.cyan("  │")}
`;

// ─────────────────────────────────────────
// DOWNLOAD
// ─────────────────────────────────────────
export const downloadBanner = `
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.cyan("●")} ${chalk.yellow("●")} ${chalk.green("●")}
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.white.bold("rvault")} ${chalk.cyan("/")} ${chalk.green("download")}
${chalk.cyan("  │")}   ${chalk.gray("Fetching your file securely")}
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.gray("────────────────────────────────")}
${chalk.cyan("  │")}
`;

// ─────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────
export const deleteBanner = `
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.cyan("●")} ${chalk.yellow("●")} ${chalk.green("●")}
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.white.bold("rvault")} ${chalk.cyan("/")} ${chalk.red("delete")}
${chalk.cyan("  │")}   ${chalk.gray("Permanently remove from vault")}
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.gray("────────────────────────────────")}
${chalk.cyan("  │")}
`;

// ─────────────────────────────────────────
// SHARE
// ─────────────────────────────────────────
export const shareBanner = `
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.cyan("●")} ${chalk.yellow("●")} ${chalk.green("●")}
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.white.bold("rvault")} ${chalk.cyan("/")} ${chalk.yellow("share")}
${chalk.cyan("  │")}   ${chalk.gray("Generate secure QR share link")}
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.gray("────────────────────────────────")}
${chalk.cyan("  │")}
`;

// ─────────────────────────────────────────
// SHARE-TO
// ─────────────────────────────────────────
export const shareToAanner = `
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.cyan("●")} ${chalk.yellow("●")} ${chalk.green("●")}
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.white.bold("rvault")} ${chalk.cyan("/")} ${chalk.yellow("share-to")}
${chalk.cyan("  │")}   ${chalk.gray("Send file directly to a user")}
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.gray("────────────────────────────────")}
${chalk.cyan("  │")}
`;

// ─────────────────────────────────────────
// INBOX
// ─────────────────────────────────────────
export const inboxBanner = `
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.cyan("●")} ${chalk.yellow("●")} ${chalk.green("●")}
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.white.bold("rvault")} ${chalk.cyan("/")} ${chalk.cyan("inbox")}
${chalk.cyan("  │")}   ${chalk.gray("Files received from other users")}
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.gray("────────────────────────────────")}
${chalk.cyan("  │")}
`;

// ─────────────────────────────────────────
// CLIP
// ─────────────────────────────────────────
export const clipBanner = `
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.cyan("●")} ${chalk.yellow("●")} ${chalk.green("●")}
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.white.bold("rvault")} ${chalk.cyan("/")} ${chalk.cyan("clip")}
${chalk.cyan("  │")}   ${chalk.gray("Cloud clipboard — sync anywhere")}
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.gray("────────────────────────────────")}
${chalk.cyan("  │")}
`;

// ─────────────────────────────────────────
// DEV
// ─────────────────────────────────────────
export const devBanner = `
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.cyan("●")} ${chalk.yellow("●")} ${chalk.green("●")}
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.white.bold("rvault")} ${chalk.cyan("/")} ${chalk.gray("--dev")}
${chalk.cyan("  │")}   ${chalk.gray("Developer info & project details")}
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.gray("────────────────────────────────")}
${chalk.cyan("  │")}
`;

// ─────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────
export const profileBanner = `
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.cyan("●")} ${chalk.yellow("●")} ${chalk.green("●")}
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.white.bold("rvault")} ${chalk.cyan("/")} ${chalk.cyan("profile")}
${chalk.cyan("  │")}   ${chalk.gray("View your account details")}
${chalk.cyan("  │")}
${chalk.cyan("  │")}   ${chalk.gray("────────────────────────────────")}
${chalk.cyan("  │")}
`;