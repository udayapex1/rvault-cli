# Rvault - Remote File Vault

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/udayapex1/rvault)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Secure, fast, and intuitive remote file storage with built-in sharing and cloud clipboard sync. Access your files from anywhere via a powerful CLI interface.

## ✨ Features

### 🔐 Secure Authentication
- **Email OTP Verification**: Secure account registration with one-time passwords
- **TOTP MFA**: Two-factor authentication using Google Authenticator or similar apps
- **JWT Tokens**: Stateless authentication for API access

### 📁 File Management
- **Cloud Storage**: Files stored securely on Backblaze B2 (S3-compatible)
- **Storage Limits**: 5GB free storage per user (expandable)
- **File Operations**: Upload, download, list, and delete files
- **Large Files**: Support for files up to 50MB

### 🔗 Sharing & Collaboration
- **Shared Links**: Generate secure download links with customizable expiry (1hr, 24hr, 7days)
- **Download Limits**: Set maximum download counts for shared links
- **Peer-to-Peer Sharing**: Send files directly to other users via inbox
- **QR Code Sharing**: Share files instantly via QR codes

### 📋 Cloud Clipboard
- **Sync Across Devices**: Copy text/snippets and access them anywhere
- **Multiple Types**: Support for text, code, URLs, and secrets
- **Auto Expiry**: Clips expire after 7 days (pinnable for permanent storage)
- **Usage Tracking**: View paste counts and manage your clips

### 🖥️ CLI Interface
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Intuitive Commands**: Simple file operations with familiar syntax
- **Interactive Prompts**: Guided setup and authentication
- **Rich Output**: Colorized terminal output with progress indicators

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB database
- Backblaze B2 account (for storage)

### Installation

```bash
# Install CLI globally
npm install -g cli-rvault

# Or run locally
git clone https://github.com/udayapex1/rvault.git
cd rvault/cli-rvault
npm install
npm link
```

### Setup Server

```bash
cd rvault-server
npm install
# Configure environment variables (.env file)
npm start
```

### First Use

```bash
# Register new account
rvault register

# Login with existing account
rvault login

# Upload your first file
rvault upload ./my-file.pdf

# Share it via QR code
rvault share my-file.pdf
```

## 📖 Usage Examples

### File Operations
```bash
# Upload files
rvault upload ./document.pdf
rvault upload ./image.jpg ./video.mp4

# List your files
rvault ls

# Download files
rvault download document.pdf

# Delete files
rvault delete old-file.txt
```

### Sharing Files
```bash
# Create shareable link
rvault share document.pdf

# Send to specific user
rvault share-to @friend ./notes.txt

# View received files
rvault inbox

# Download from inbox
rvault inbox download <file-id>
```

### Cloud Clipboard
```bash
# Copy text to cloud
rvault clip copy "Hello, World!"

# Copy code snippet
rvault clip copy "console.log('Hello');" --label "JS Greeting"

# Paste latest clip
rvault clip paste

# List all clips
rvault clip ls
```

## 🏗️ Architecture

### CLI Component (`cli-rvault/`)
- **Framework**: Node.js with Commander.js
- **UI**: React-based terminal UI with Ink
- **Networking**: Axios for API communication
- **Storage**: Local config store for credentials

### Server Component (`rvault-server/`)
- **Framework**: Express.js with ES6 modules
- **Database**: MongoDB with Mongoose ODM
- **Storage**: AWS SDK for Backblaze B2 integration
- **Security**: bcrypt for passwords, JWT for sessions, TOTP for MFA
- **Email**: Nodemailer for OTP delivery

### Data Models
- **Users**: Account management with MFA
- **Files**: Metadata and storage references
- **SharedLinks**: Temporary access tokens
- **Inbox**: Peer-to-peer file transfers
- **Clips**: Cloud clipboard entries

## 🔧 Configuration

### Environment Variables (Server)
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/rvault
JWT_SECRET=your-jwt-secret
B2_KEY_ID=your-b2-key-id
B2_APP_KEY=your-b2-app-key
B2_BUCKET_NAME=your-bucket
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### CLI Configuration
Credentials are stored locally using `configstore`. Use `rvault logout` to clear stored tokens.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ by [Uday Pareta](https://github.com/udayapex1)
- Storage powered by [Backblaze B2](https://www.backblaze.com/b2/)
- CLI inspired by modern developer tools

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/udayapex1/rvault/issues)
- **Discussions**: [GitHub Discussions](https://github.com/udayapex1/rvault/discussions)
- **Email**: support@rvault.dev

---

**Rvault** - Your files, secure and accessible everywhere. 🚀</content>
<parameter name="filePath">/home/apexuday/Pictures/rvault/README.md