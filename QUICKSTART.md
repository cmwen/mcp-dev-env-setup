# Quick Start Guide

## Installation

### For Development

```bash
# Clone the repository
git clone https://github.com/cmwen/mcp-dev-env-setup.git
cd mcp-dev-env-setup

# Install dependencies
npm install

# Build the project
npm run build

# Test locally
npm run dev
```

### For End Users (once published)

```bash
npm install -g mcp-dev-env-setup
```

Or use directly with npx:
```bash
npx -y mcp-dev-env-setup
```

## Integration with Claude Desktop

1. Open Claude Desktop configuration:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

2. Add the MCP server:

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

Or if you have it installed locally:

```json
{
  "mcpServers": {
    "dev-env-setup": {
      "command": "node",
      "args": ["/path/to/mcp-dev-env-setup/dist/index.js"]
    }
  }
}
```

3. Restart Claude Desktop

## Quick Usage

Once integrated with Claude Desktop, you can ask Claude to:

- **Check your development environment:**
  - "Check what development tools I have installed"
  - "Show me my current dev environment status"

- **Install tools:**
  - "Install Python on my Mac"
  - "Set up Node.js for me"
  - "Install Flutter and Android development tools"

- **Set up everything at once:**
  - "Set up my Mac for full-stack development"
  - "Install all development tools except Flutter"

## Example Conversations

### Setting up a new Mac

```
You: I just got a new Mac and need to set it up for development. What do I have installed?

Claude: Let me check your current development environment...
[uses check_environment tool]

You: Can you install everything I need for full-stack development?

Claude: I'll set up all the development tools for you...
[uses setup_all tool]
```

### Installing specific tools

```
You: I need Python for a data science project

Claude: I'll install Python for you...
[uses install_python tool]

You: Great! Now I need Node.js too

Claude: Installing Node.js via nvm...
[uses install_nodejs tool]
```

## What Gets Installed

### Homebrew
- Package manager for macOS
- Required for most other installations

### Python
- Python 3 (latest version via Homebrew)
- pip package manager
- setuptools

### Node.js
- Installed via nvm (Node Version Manager)
- Allows easy version switching
- npm package manager included

### Flutter
- Flutter SDK (stable channel)
- Installed in ~/development/flutter
- Added to PATH automatically

### Android Development
- Java/OpenJDK 17
- Android Studio
- Android SDK configuration
- Environment variables setup

## Post-Installation

After installation, you'll need to:

1. **Restart your terminal** to load new PATH settings
2. **For Android Studio**: Run the setup wizard manually
3. **For Flutter**: Run `flutter doctor` to verify setup

## Need Help?

- Check [USAGE.md](USAGE.md) for detailed examples
- Check [CONTRIBUTING.md](CONTRIBUTING.md) to contribute
- Open an issue on GitHub for bugs or feature requests

## Platform Support

Currently supported:
- ✅ macOS (Apple Silicon and Intel)

Coming soon:
- 🚧 Linux
- 🚧 Windows (WSL)
