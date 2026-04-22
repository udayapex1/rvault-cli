#

<div align="center">
  <img src="https://res.cloudinary.com/dwemivxbp/image/upload/v1776882458/rvault-banner_e3v16y.svg" alt="rvault banner" width="100%"/>
</div>


## 🚀 Rvault CLI

A powerful terminal tool to **store, access, and share files securely from anywhere**.

No UI. No friction. Just your terminal.

---

## ⚡ Install

```bash
npm install -g cli-rvault
```

---

## ⚡ Quick Start

```bash
rvault login
rvault upload file.txt
rvault list
rvault download <id>
rvault share <id>
```

---

## ✨ Core Features

### 🔐 Secure by Design

* End-to-end encrypted file storage
* Multi-layer authentication
* Safe sharing with controlled access

### 📁 File Vault

* Upload and store files remotely
* Access anytime from any machine
* Clean listing and fast retrieval

### 🔗 Smart Sharing

* Generate shareable links
* Set expiry for access
* Send files directly to other users

### 📋 Cloud Clipboard

* Copy text across devices
* Store snippets, secrets, links
* Instant sync via terminal

### ⚡ CLI Experience

* Fast and minimal commands
* Interactive prompts when needed
* Clean, readable terminal output

---

## 📖 Commands

### File Management

```bash
rvault upload <file>
rvault download <id>
rvault list
rvault delete <id>
```

### Sharing

```bash
rvault share <id>
rvault share <id> --expires 24h
```

### Clipboard

```bash
rvault clip push "text"
rvault clip pull
rvault clip list
```

### Authentication

```bash
rvault login
rvault register
rvault logout
```

---

## ⚙️ Flags

```bash
-h, --help        Show help
-v, --version     Show version
-V, --verbose     Detailed logs
-q, --quiet       Minimal output
-j, --json        JSON output
```

---

## 👨‍💻 Author

Uday Pareta
GitHub: https://github.com/udayapex1

---

## 📄 License

MIT

---

## ⚡ Philosophy

Rvault is built for developers who prefer:

* Terminal over UI
* Speed over complexity
* Control over abstraction

---

**Your files. Your control. Anywhere.**
