# MCP Dev Environment Setup Server

An MCP (Model Context Protocol) server that automates the setup of local development environments for Python, Node.js, Flutter, and Android development on macOS.

## Features

- **Python Environment Setup**: Install Python via Homebrew, manage virtual environments, and install pip packages
- **Node.js Environment Setup**: Install Node.js via nvm, manage npm packages, and configure yarn/pnpm
- **Flutter Environment Setup**: Install Flutter SDK, configure PATH, and verify installation
- **Android Environment Setup**: Install Android Studio, SDK tools, and configure environment variables
- **System Checks**: Verify existing installations and detect system requirements
- **Homebrew Integration**: Automatically install and use Homebrew for package management

## Installation

```bash
npm install -g mcp-dev-env-setup
```

## Usage

This MCP server can be integrated with any MCP client. It provides tools for:

- Checking if development tools are installed
- Installing development environments
- Configuring environment variables
- Verifying installations

### Available Tools

1. **check_environment** - Check what development tools are currently installed
2. **install_python** - Install Python and configure pip
3. **install_nodejs** - Install Node.js via nvm
4. **install_flutter** - Install Flutter SDK
5. **install_android** - Install Android development tools
6. **setup_all** - Set up all development environments at once

## Configuration

The server runs as a stdio-based MCP server and can be configured in your MCP client settings.

Example configuration for Claude Desktop:

```json
{
  "mcpServers": {
    "dev-env-setup": {
      "command": "npx",
      "args": ["-y", "mcp-dev-env-setup"]
    }
  }
}
```

## Requirements

- macOS (currently supported)
- Admin privileges for some installations

## License

MIT
