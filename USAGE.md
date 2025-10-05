# Usage Examples

## Testing the MCP Server Locally

### 1. Using the development server

```bash
npm run dev
```

### 2. Using the built version

```bash
npm run build
node dist/index.js
```

## Integration with MCP Clients

### Claude Desktop Configuration

Add to your Claude Desktop configuration file (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

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

Or use via npx (once published to npm):

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

## Available Tools

### check_environment

Check which development tools are currently installed.

**Example:**
```
Tool: check_environment
Arguments: {}
```

**Response:**
```markdown
# Development Environment Status

✅ **Homebrew**: Installed (Homebrew 4.1.0)
❌ **Python**: Not installed
✅ **Node.js**: Installed (v20.10.0)
✅ **nvm**: Installed (0.39.7)
❌ **Flutter**: Not installed
❌ **Java**: Not installed
❌ **Android Studio**: Not installed
```

### install_homebrew

Install Homebrew package manager.

**Example:**
```
Tool: install_homebrew
Arguments: {}
```

### install_python

Install Python 3 and pip.

**Example:**
```
Tool: install_python
Arguments: {}
```

### install_nodejs

Install Node.js via nvm.

**Example:**
```
Tool: install_nodejs
Arguments: {
  "version": "lts"
}
```

Or install a specific version:
```
Tool: install_nodejs
Arguments: {
  "version": "20"
}
```

### install_flutter

Install Flutter SDK.

**Example:**
```
Tool: install_flutter
Arguments: {}
```

### install_android

Install Android Studio and development tools.

**Example:**
```
Tool: install_android
Arguments: {}
```

### setup_all

Install all development environments at once.

**Example:**
```
Tool: setup_all
Arguments: {}
```

Skip specific environments:
```
Tool: setup_all
Arguments: {
  "skip": ["flutter", "android"]
}
```

## Typical Workflows

### Setting up a new machine for full-stack development

1. Check current state:
   ```
   check_environment
   ```

2. Install all tools:
   ```
   setup_all
   ```

3. Restart terminal and verify:
   ```
   check_environment
   ```

### Setting up for Python development only

1. Check current state:
   ```
   check_environment
   ```

2. Install Python:
   ```
   install_python
   ```

3. Verify installation:
   ```
   check_environment
   ```

### Setting up for mobile development

1. Install Node.js (for React Native):
   ```
   install_nodejs
   ```

2. Install Flutter:
   ```
   install_flutter
   ```

3. Install Android tools:
   ```
   install_android
   ```

4. Complete Android Studio setup wizard manually

5. Verify all tools:
   ```
   check_environment
   ```

## Post-Installation Steps

### After Installing Node.js via nvm

Restart your terminal or run:
```bash
source ~/.zshrc  # or ~/.bash_profile
```

### After Installing Flutter

1. Restart terminal
2. Run `flutter doctor` to check for any remaining dependencies
3. Accept Android licenses: `flutter doctor --android-licenses`

### After Installing Android Studio

1. Open Android Studio
2. Complete the setup wizard
3. Install Android SDK via Android Studio settings
4. Create an Android Virtual Device (AVD) for testing
5. Accept Android licenses: `flutter doctor --android-licenses` (if using Flutter)

## Troubleshooting

### Homebrew installation fails

- Ensure you have Xcode Command Line Tools: `xcode-select --install`
- Check for disk space
- Review Homebrew installation logs

### Python installation fails

- Check if Homebrew is installed: `brew --version`
- Try updating Homebrew: `brew update`

### Node.js via nvm doesn't work

- Ensure the terminal is restarted
- Source the shell config: `source ~/.zshrc`
- Check if nvm is in PATH: `command -v nvm`

### Flutter installation fails

- Ensure git is installed: `git --version`
- Check internet connection
- Verify disk space in ~/development/

### Android Studio installation requires manual steps

This is expected. Android Studio requires:
1. Running the first-time setup wizard
2. Installing the Android SDK
3. Creating virtual devices
4. Accepting licenses

These steps must be done through the Android Studio GUI.
