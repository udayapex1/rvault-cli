import inquirer from "inquirer";
import ora from "ora";
import chalk from "chalk";
import axios from "axios";
import { registerBanner } from "../../utils/banners.js";
import * as authServices from "../services/authServices.js";


export const register = async () =>{
   console.log(registerBanner);
   // input user details :
  
   const { name , email , username , password } = await  inquirer.prompt([
    {
        type : "input",
        name : "name",
        message : chalk.gray("Enter your full name :"),
        validate : (input) => input.trim() !== "" || "Name cannot be empty"
    } ,
    {
        type : "input",
        name : "email",
        message : chalk.gray("Enter your email :"),
        validate : (input) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(input) || "Please enter a valid email address";
        }
    } ,
      {
      type: "input",
      name: "username",
      message: chalk.gray("  Username") + chalk.cyan(" (@):"),
      validate: (v) => /^[a-z0-9_]{3,20}$/.test(v) || "3-20 chars, lowercase only",
      filter: (v) => v.toLowerCase().replace("@", ""),
    },
  {
      type: "password",
      name: "password",
      message: chalk.gray("  Password:"),
      mask: "●",
      validate: (v) => v.length >= 8 || "Min 8 characters",
    },
   ]);

   const spinner = ora({
    text: chalk.gray("  Sending OTP to ") + chalk.cyan(email),
    spinner: "dots",
  }).start();

  let userId;
   
  try {
    const res = await authServices.register({ name, email, username, password });
    userId = res.userId;
    spinner.succeed(chalk.green("  OTP sent to ") + chalk.cyan(email));
  } catch (error) {
     spinner.fail(
    chalk.red("  " + (error.response?.data?.message || "Registration failed"))
  );
  process.exit(1);
  }

  // ─── Step 3: Verify OTP ───
console.log();

const { otp } = await inquirer.prompt([
  {
    type: "input",
    name: "otp",
    message: chalk.gray("  Enter the OTP you received:"),
    validate: (v) =>
      /^\d{6}$/.test(v) || "Enter a valid 6-digit OTP",
  },
]);

const spinner2 = ora({
  text: chalk.gray("  Verifying OTP..."),
  spinner: "dots",
}).start();

let qrCode, manualKey;

try {
  const res = await authServices.verifyOTP({ userId, otp });

  // assuming your backend returns { qrCode, manualKey }
  qrCode = res.qrCode;
  manualKey = res.manualKey;

  spinner2.succeed(chalk.green("  Email verified!"));
} catch (err) {
  spinner2.fail(chalk.red("  " + err.message));
  process.exit(1);
}
    // ─── Step 4: TOTP Setup ───
  console.log();
  console.log(chalk.cyan("  ┌─────────────────────────────────────────┐"));
  console.log(chalk.cyan("  │") + chalk.yellow.bold("  Setup Google Authenticator            ") + chalk.cyan(" │"));
  console.log(chalk.cyan("  │") + chalk.gray("  Scan the QR code to enable 2FA          ") + chalk.cyan("│"));
  console.log(chalk.cyan("  └─────────────────────────────────────────┘"));
  console.log();
  console.log(chalk.gray("  Manual key  ") + chalk.cyan(manualKey));
  console.log();
  console.log(chalk.gray("  Steps:"));
  console.log(chalk.gray("  1. Open") + chalk.white(" Google Authenticator"));
  console.log(chalk.gray("  2. Tap") + chalk.white(" + → Enter setup key"));
  console.log(chalk.gray("  3. Paste the manual key above"));
  console.log();

    // Display QR code in terminal:
    const { openQR } = await inquirer.prompt([
   {
      type: "confirm",
      name: "openQR",
      message: chalk.gray("  Open QR code in browser?"),
      default: true,
    },
    ]);

    if (openQR) {
    const { default: open } = await import("open");
    // Save QR as temp HTML and open
    const fs = await import("fs");
    const os = await import("os");
    const path = await import("path");
    const tmpFile = path.join(os.tmpdir(), "rvault-qr.html");
    fs.writeFileSync(tmpFile, `
      <html>
        <body style="background:#0d0d0d;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;">
          <p style="color:#00d4ff;font-family:monospace;margin-bottom:20px;">rvault · Scan this QR in Google Authenticator</p>
          <img src="${qrCode}" style="border-radius:12px;"/>
          <p style="color:#444;font-family:monospace;margin-top:16px;">You can close this tab after scanning.</p>
        </body>
      </html>
    `);
    await open(tmpFile);
    console.log(chalk.green("  ✓  QR opened in browser!"));
  };

   console.log();
  console.log(chalk.gray("  After scanning, run:"));
  console.log(chalk.cyan("  $ rvault login"));
  console.log();

  // ─── Success ───
  console.log(chalk.cyan("  ────────────────────────────────────────"));
  console.log(chalk.green("  ✓  Account created successfully!"));
  console.log(chalk.gray("  Welcome to rvault, ") + chalk.cyan(`@${username}`));
  console.log(chalk.cyan("  ────────────────────────────────────────"));
  console.log();
};

export const registertest = async () => {
    console.log("thi sis tes")
}
