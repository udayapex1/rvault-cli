#!/usr/bin/env node


import { program } from "commander";
import chalk from "chalk";
import { dev } from "../src/commands/dev.js";
import axios from "axios";
import { register } from "../src/commands/register.js";
import { login } from "../src/commands/login.js";
import { logout } from "../src/commands/logout.js";
import { profile } from "../src/commands/profile.js";
import { myuploads } from "../src/commands/myuploads.js";
import { getfile } from "../src/commands/getfile.js";
import { deleteCmd } from "../src/commands/delete.js";

const banner = `
${chalk.cyan("██████╗ ██╗   ██╗ █████╗ ██╗   ██╗██╗  ████████╗")}
${chalk.cyan("██╔══██╗██║   ██║██╔══██╗██║   ██║██║  ╚══██╔══╝")}
${chalk.cyan("██████╔╝██║   ██║███████║██║   ██║██║     ██║   ")}
${chalk.cyan("██╔══██╗╚██╗ ██╔╝██╔══██║██║   ██║██║     ██║   ")}
${chalk.cyan("██║  ██║ ╚████╔╝ ██║  ██║╚██████╔╝███████╗██║   ")}
${chalk.gray("╚═╝  ╚═╝  ╚═══╝  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝   ")}

${chalk.gray("  Remote File Vault — by")} ${chalk.cyan("@udayapex1")}
`;

program
  .name("rvault")
  .description("Remote File Vault CLI")
  .version(
    chalk.cyan("1.0.0"),
    "-v, --version",
    "Show current version"
  )
  // Register the flags

  .option("--dev", "Show developer profile and project details")
  .option("--health", "Check server health")
  .addHelpText("before", banner)
  .addHelpText("after", `
${chalk.gray("─────────────────────────────────────────────")}
${chalk.gray("  Examples:")}

  ${chalk.cyan("$")} ${chalk.white("rvault register")}
  ${chalk.cyan("$")} ${chalk.white("rvault login")}
  ${chalk.cyan("$")} ${chalk.white("rvault upload ./resume.pdf")}
  ${chalk.cyan("$")} ${chalk.white("rvault share resume.pdf")}
  ${chalk.cyan("$")} ${chalk.white("rvault share-to @palak ./notes.pdf")}
  ${chalk.cyan("$")} ${chalk.white("rvault inbox")}
  ${chalk.cyan("$")} ${chalk.white("rvault clip copy \"hello world\"")}

${chalk.gray("─────────────────────────────────────────────")}
${chalk.gray("  Docs:")} ${chalk.cyan("https://github.com/udayapex1/rvault-cli")}
${chalk.gray("─────────────────────────────────────────────")}
  `);


// ─── Flag Logic ───
// We parse options first to catch --dev before commands
program.on("option:dev", () => {
  dev();
  process.exit(0);
});



// ─── Auth ───
program.command("register").description("Create a new account").action(register);
program.command("login").description("Login to your account").action(login);
program.command("logout").description("Logout").action(logout);
program.command("profile").description("View your profile details").action(profile);

// ─── Files ───
program.command("upload <file>").description("Upload a file to vault");
program.command("myuploads").alias("ls").description("List your uploaded files").action(myuploads);
program.command("getfile").alias("download").description("Select and download a file").action(getfile);
program.command("delete").description("Select and delete a file").action(deleteCmd);

// ─── Share ───
program.command("share <filename>").description("Share file via QR link");
program.command("share-to <username> <file>").description("Send file to a user");

// ─── Inbox (subcommands) ───
const inbox = program
  .command("inbox")
  .description("Manage your inbox");

inbox
  .command("download <id>")
  .description("Download file from inbox");

inbox
  .command("reject <id>")
  .description("Reject file from inbox");

inbox
  .command("sent")
  .description("View sent files");

// ─── Clip (subcommands) ───
const clip = program
  .command("clip")
  .description("Cloud clipboard sync");

clip
  .command("copy <text>")
  .description("Copy text to cloud clipboard");

clip
  .command("paste")
  .description("Paste latest clip");

clip
  .command("ls")
  .description("List all clips");

clip
  .command("delete <id>")
  .description("Delete a clip");

clip
  .command("clear")
  .description("Clear all clips");

// ─── Execution ───
if (process.argv.includes("--health")) {
  console.log(chalk.cyan("Checking server health..."));
  axios.get("https://rvault-cli.onrender.com/health")
    .then(response => {
      console.log(chalk.green("✔ Server is running !"));
      console.dir(response.data, { depth: null, colors: true });
      console.log("this feature remove after testing..")
      process.exit(0);
    })
    .catch(error => {
      console.log(chalk.red("✖ Server health check failed."));
      console.log(chalk.red(error.message));
      process.exit(1);
    });
} else {
  program.parse(process.argv);

  // If no arguments are provided, show help
  if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
}