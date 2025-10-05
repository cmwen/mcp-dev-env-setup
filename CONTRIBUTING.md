# Contributing to MCP Dev Environment Setup

Thank you for your interest in contributing! Here are some guidelines:

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Make your changes
4. Build: `npm run build`
5. Test locally: `npm run dev`

## Code Style

- Use TypeScript
- Follow existing code patterns
- Add comments for complex logic
- Keep functions focused and modular

## Pull Requests

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request with a clear description

## Adding New Features

When adding support for new tools or platforms:
- Add detection logic in `src/utils/check.ts`
- Add installation logic in `src/tools/install.ts`
- Update the main server in `src/index.ts`
- Update the README.md

## Platform Support

Currently supporting macOS. Contributions for Linux and Windows are welcome!

## Questions?

Open an issue for discussion before starting major changes.
