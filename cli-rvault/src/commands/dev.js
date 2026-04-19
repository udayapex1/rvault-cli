import chalk from "chalk";

const bar = () =>
  chalk.gray("_".repeat(78));

const pipeBar = () =>
  chalk.gray("|".repeat(78));

const center = (text) => {
  const width = 78;
  const padding = Math.floor((width - text.length) / 2);
  return " ".repeat(padding) + text;
};

export const dev = () => {
  console.log();
  console.log(bar());
  console.log(bar());
  console.log();

  console.log(chalk.white.bold(center("R V A U L T   C L I")));
  console.log(chalk.gray(center("Remote File Vault Specification")));
  console.log();

  console.log(chalk.gray(center("Version: 1.0.0")));
  console.log(chalk.gray(center("Status : Production Ready")));
  console.log(chalk.gray(center("License: MIT")));
  console.log();

  console.log(bar());
  console.log();

  console.log(chalk.cyan("PRODUCT SUMMARY"));
  console.log("Name        : Remote File Vault");
  console.log("Identifier  : rvault-cli");
  console.log("Platform    : Node.js CLI");
  console.log();

  console.log(chalk.cyan("CORE CAPABILITIES"));
  console.log("Storage     : S3-Compatible (B2)");
  console.log("Sync Engine : Cloud Clipboard");
  console.log("Transfer    : Peer-to-Peer Sharing");
  console.log("Security    : End-to-End Encryption");
  console.log("Auth        : JWT + MFA");
  console.log();

  console.log(chalk.cyan("RESOURCES"));
  console.log("Docs        : github.com/udayapex1/rvault-cli");
  console.log("Issues      : github.com/udayapex1/rvault-cli/issues");
  console.log("NPM         : npmjs.com/~udayapex1");
  console.log();

  console.log(chalk.cyan("ARCHITECT"));
  console.log("Developer   : Uday Pareta");
  console.log("Username    : @udayapex1");
  console.log("Portfolio   : uday-woad-mu.vercel.app");
  console.log("Contact     : udaypareta645@gmail.com");
  console.log();

  console.log(bar());
  console.log();

  console.log(
    chalk.gray(
      center("D I S T R I B U T E D   V I A   N P M   R E G I S T R Y")
    )
  );

  console.log(pipeBar());
  console.log(
    chalk.white(
      center("E N D   O F   R V A U L T   S P E C I F I C A T I O N")
    )
  );
  console.log(pipeBar());
  console.log();
};