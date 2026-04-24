import inquirer from "inquirer";
import ora from "ora";
import chalk from "chalk";
import axios from "axios";
import { registerBanner } from "../../utils/banners.js";
import * as authServices from "../services/authServices.js";


export const register = async () => {
  console.log(registerBanner);
  // input user details :

  const { name, email, username, password } = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: chalk.gray("Enter your full name :"),
      validate: (input) => input.trim() !== "" || "Name cannot be empty"
    },
    {
      type: "input",
      name: "email",
      message: chalk.gray("Enter your email :"),
      validate: (input) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(input) || "Please enter a valid email address";
      }
    },
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
    spinner.fail(chalk.red("  " + (error.message || "Registration failed")));

    const msg = (error.message || "").toLowerCase();
    if (msg.includes("already") || msg.includes("exist") || msg.includes("duplicate")) {
      console.log();
      console.log(chalk.yellow("  ⚠  This email or username is already registered."));
      console.log(chalk.gray("  Try:") + chalk.cyan("  rvault login"));
    }
    process.exit(1);
  }

  // ─── Step 3: Verify OTP ───
  console.log();

  let qrCode, manualKey;
  let verified = false;

  while (!verified) {
    const { otp } = await inquirer.prompt([
      {
        type: "input",
        name: "otp",
        message: chalk.gray("  Enter the OTP you received:"),
        validate: (v) => /^\d{6}$/.test(v) || "Enter a valid 6-digit OTP",
      },
    ]);

    const spinner2 = ora({ text: chalk.gray("  Verifying OTP..."), spinner: "dots" }).start();

    try {
      const res = await authServices.verifyOTP(userId, otp);

      qrCode = res.qrCode ?? res.qr ?? res.qrCodeUrl ?? null;
      manualKey = res.manualKey ?? res.secret ?? res.totpSecret ?? null;

      spinner2.succeed(chalk.green("  Email verified!"));
      verified = true;
    } catch (err) {
      spinner2.fail(chalk.red("  " + (err.message || "Invalid OTP")));
      console.log();

      const { action } = await inquirer.prompt([
        {
          type: "rawlist",
          name: "action",
          message: chalk.gray("  What would you like to do?"),
          choices: [
            { name: "Try again (enter OTP again)", value: "retry" },
            { name: "Resend OTP to my email", value: "resend" },
            { name: "Cancel registration", value: "cancel" },
          ],
        },
      ]);

      if (action === "cancel") {
        console.log(chalk.gray("\n  Registration cancelled.\n"));
        process.exit(0);
      }

      if (action === "resend") {
        const spinner3 = ora({ text: chalk.gray("  Sending a new OTP..."), spinner: "dots" }).start();
        try {
          await authServices.resendOTP(userId);
          spinner3.succeed(chalk.green("  New OTP sent to ") + chalk.cyan(email));
        } catch (e) {
          spinner3.fail(chalk.red("  " + (e.message || "Failed to resend OTP")));
          process.exit(1);
        }
        console.log();
      }
      // "retry" falls through to top of while loop automatically
    }
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
    const fs = await import("fs");
    const os = await import("os");
    const path = await import("path");

    const tmpFile = path.join(os.tmpdir(), "rvault-qr.html");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>rvault · Scan QR</title>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0a0a0a;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'DM Sans', sans-serif;
      overflow: hidden;
      position: relative;
    }
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image:
        linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
      background-size: 40px 40px;
      pointer-events: none;
      z-index: 0;
    }
    body::after {
      content: '';
      position: fixed;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%);
      pointer-events: none;
      z-index: 0;
    }
    .card {
      position: relative;
      z-index: 1;
      background: #111111;
      border: 1px solid #222;
      border-radius: 20px;
      padding: 40px 44px 36px;
      width: 380px;
      text-align: center;
      animation: fadeUp 0.5s ease both;
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .card::before {
      content: '';
      position: absolute;
      top: 0; left: 24px; right: 24px;
      height: 1px;
      background: linear-gradient(90deg, transparent, #00d4ff55, transparent);
      border-radius: 999px;
    }
    .logo {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #1a1a1a;
      border: 1px solid #2a2a2a;
      border-radius: 10px;
      padding: 8px 14px;
      margin-bottom: 28px;
    }
    .logo-dots { display: flex; gap: 4px; }
    .logo-dot { width: 7px; height: 7px; border-radius: 50%; }
    .logo-name {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px; font-weight: 600;
      color: #e0e0e0; letter-spacing: 0.04em;
    }
    .cursor { border-right: 2px solid #00d4ff; animation: blink 1s step-end infinite; }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
    h1 { font-size: 22px; font-weight: 600; color: #f0f0f0; margin-bottom: 8px; letter-spacing: -0.02em; }
    .subtitle { font-size: 13.5px; color: #666; line-height: 1.6; margin-bottom: 32px; }
    .subtitle strong { color: #00d4ff; font-weight: 500; }
    .qr-wrapper {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 28px;
    }
    .qr-box {
      width: 200px; height: 200px;
      background: #f8f8f8;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }
    .qr-box img { width: 180px; height: 180px; object-fit: contain; display: block; }
    .qr-box::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, #00d4ff, transparent);
      animation: scan 2.4s ease-in-out infinite;
    }
    @keyframes scan {
      0%   { top: 0%;   opacity: 0; }
      10%  { opacity: 1; }
      90%  { opacity: 1; }
      100% { top: 100%; opacity: 0; }
    }
    .bracket { position: absolute; width: 18px; height: 18px; border-color: #00d4ff; border-style: solid; }
    .bracket.tl { top: -6px; left: -6px; border-width: 2px 0 0 2px; border-radius: 4px 0 0 0; }
    .bracket.tr { top: -6px; right: -6px; border-width: 2px 2px 0 0; border-radius: 0 4px 0 0; }
    .bracket.bl { bottom: -6px; left: -6px; border-width: 0 0 2px 2px; border-radius: 0 0 0 4px; }
    .bracket.br { bottom: -6px; right: -6px; border-width: 0 2px 2px 0; border-radius: 0 0 4px 0; }
    .security-row { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 28px; }
    .security-label { font-size: 12px; color: #444; font-family: 'JetBrains Mono', monospace; }
    .security-id {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px; font-weight: 600; color: #888;
      background: #1a1a1a; border: 1px solid #2a2a2a;
      padding: 3px 10px; border-radius: 6px; letter-spacing: 0.08em;
    }
    .identity-bar {
      background: #131313; border: 1px solid #1e1e1e;
      border-radius: 12px; padding: 14px 16px;
      text-align: left; display: flex; gap: 12px; align-items: flex-start;
    }
    .shield-icon { flex-shrink: 0; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; margin-top: 1px; }
    .identity-title { font-size: 12.5px; font-weight: 600; color: #ccc; margin-bottom: 4px; }
    .identity-body { font-size: 12px; color: #555; line-height: 1.55; }
    .identity-body span { color: #00d4ff; }
    .close-hint { margin-top: 20px; font-size: 11.5px; color: #333; font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">
      <div class="logo-dots">
        <div class="logo-dot" style="background:#ff5f57;"></div>
        <div class="logo-dot" style="background:#febc2e;"></div>
        <div class="logo-dot" style="background:#28c840;"></div>
      </div>
      <span class="logo-name">&gt; rv<span class="cursor">&ZeroWidthSpace;</span></span>
    </div>
    <h1>Scan to authenticate</h1>
    <p class="subtitle">
      Open <strong>Google Authenticator</strong> and scan this QR.<br/>
      It expires in <strong>10 minutes</strong>.
    </p>
    <div class="qr-wrapper">
      <div class="bracket tl"></div>
      <div class="bracket tr"></div>
      <div class="bracket bl"></div>
      <div class="bracket br"></div>
      <div class="qr-box">
        <img src="${qrCode}" alt="QR Code" />
      </div>
    </div>
    <div class="security-row">
      <span class="security-label">Manual key</span>
      <span class="security-id">${manualKey}</span>
    </div>
    <div class="identity-bar">
      <div class="shield-icon">
        <svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 1L2 4.5V10C2 14.42 5.46 18.56 10 19.93C14.54 18.56 18 14.42 18 10V4.5L10 1Z" stroke="#00d4ff" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
          <path d="M7 10.5L9 12.5L13 8.5" stroke="#00d4ff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div>
        <div class="identity-title">Identity Protection</div>
        <div class="identity-body">
          This request originated from a new login attempt for
          <span>${email}</span>.
          If this wasn't you, ignore this or contact support.
        </div>
      </div>
    </div>
    <p class="close-hint">You can close this tab after scanning.</p>
  </div>
</body>
</html>`;

    fs.writeFileSync(tmpFile, html);
    await open(tmpFile);
    console.log(chalk.green("  ✓  QR opened in browser!"));
  }

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
