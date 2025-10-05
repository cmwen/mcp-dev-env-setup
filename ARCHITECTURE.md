# Architecture Overview

This document provides a visual and technical overview of the dual-mode architecture.

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    User Interface                    │
├──────────────────────┬──────────────────────────────┤
│    CLI Terminal      │      MCP Client (AI)         │
│                      │                              │
│  $ devenv check      │  Model Context Protocol      │
│  $ devenv install    │  Integration                 │
└──────────────────────┴──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              src/index.ts (Entry Point)              │
│                                                      │
│  Mode Detection Logic:                              │
│  • No args or --stdio/--mcp → MCP Mode             │
│  • CLI args → CLI Mode                              │
└──────────────────────┬──────────────────────────────┘
                       │
           ┌───────────┴───────────┐
           ▼                       ▼
┌──────────────────────┐  ┌──────────────────────┐
│   src/cli.ts         │  │  src/mcp-server.ts  │
│   (CLI Mode)         │  │  (MCP Mode)         │
│                      │  │                     │
│  • Commander.js      │  │  • MCP SDK          │
│  • Chalk (colors)    │  │  • STDIO Transport  │
│  • Ora (spinners)    │  │  • Tool Handlers    │
└──────────────────────┘  └──────────────────────┘
           │                       │
           └───────────┬───────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│              Core Business Logic                     │
├──────────────────────┬──────────────────────────────┤
│  core/               │  installers/                 │
│  • package-manager   │  • unified-installer         │
│  • tool-config       │                              │
├──────────────────────┼──────────────────────────────┤
│  validators/         │  utils/                      │
│  • environment       │  • shell                     │
│                      │  • check                     │
└──────────────────────┴──────────────────────────────┘
```

## Mode Detection Flow

```
Start: devenv [args]
         │
         ▼
┌──────────────────────┐
│ Parse Arguments      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Check:                           │
│ • args.length === 0 ?           │
│ • args.includes('--stdio') ?    │
│ • args.includes('--mcp') ?      │
└──────┬───────────────────────────┘
       │
       ├─ Yes ─▶ ┌──────────────┐
       │          │  MCP Mode    │
       │          │  • STDIO     │
       │          │  • AI Tools  │
       │          └──────────────┘
       │
       └─ No ──▶ ┌──────────────┐
                  │  CLI Mode    │
                  │  • Commands  │
                  │  • Interactive │
                  └──────────────┘
```

## CLI Architecture

```
┌─────────────────────────────────────────┐
│         CLI Entry (src/cli.ts)          │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌───────────────┐   ┌───────────────┐
│   Commander   │   │   UI Layer    │
│   Framework   │   │               │
│               │   │ • Chalk       │
│ • Commands    │   │ • Ora         │
│ • Options     │   │ • Formatting  │
│ • Help        │   │               │
└───────┬───────┘   └───────┬───────┘
        │                   │
        └─────────┬─────────┘
                  ▼
        ┌─────────────────┐
        │  Command Router │
        └────────┬────────┘
                 │
    ┌────────────┼────────────┐
    ▼            ▼            ▼
┌────────┐ ┌─────────┐ ┌──────────┐
│ check  │ │  info   │ │ install  │
└────────┘ └─────────┘ └──────────┘
    │            │            │
    └────────────┼────────────┘
                 ▼
    ┌────────────────────────┐
    │   Core Business Logic  │
    └────────────────────────┘
```

## MCP Architecture

```
┌─────────────────────────────────────────┐
│       MCP Entry (src/mcp-server.ts)     │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌───────────────┐   ┌───────────────┐
│   MCP SDK     │   │   Transport   │
│               │   │               │
│ • Server      │   │ • STDIO       │
│ • Handlers    │   │ • Protocol    │
│ • Types       │   │               │
└───────┬───────┘   └───────┬───────┘
        │                   │
        └─────────┬─────────┘
                  ▼
        ┌─────────────────┐
        │  Tool Handlers  │
        └────────┬────────┘
                 │
    ┌────────────┼────────────┐
    ▼            ▼            ▼
┌─────────────┐ ┌──────────┐ ┌─────────────┐
│ check_env   │ │ get_info │ │ install_*   │
└─────────────┘ └──────────┘ └─────────────┘
        │            │            │
        └────────────┼────────────┘
                     ▼
        ┌────────────────────────┐
        │   Core Business Logic  │
        └────────────────────────┘
```

## Module Dependencies

```
┌─────────────────────────────────────────────────────┐
│                    index.ts                          │
│              (Entry Point & Router)                  │
└───────────┬──────────────────────┬──────────────────┘
            │                      │
            ▼                      ▼
┌───────────────────────┐  ┌──────────────────────┐
│      cli.ts           │  │   mcp-server.ts      │
│                       │  │                      │
│  Dependencies:        │  │  Dependencies:       │
│  • commander          │  │  • @mcp/sdk          │
│  • chalk              │  │  • zod               │
│  • ora                │  │                      │
└───────┬───────────────┘  └──────┬───────────────┘
        │                         │
        └──────────┬──────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌───────────────┐     ┌────────────────┐
│  Core Layer   │     │  Installer     │
│               │     │  Layer         │
│ • package-mgr │     │                │
│ • tool-config │     │ • unified      │
└───────┬───────┘     └────────┬───────┘
        │                      │
        └──────────┬───────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌───────────────┐     ┌────────────────┐
│  Validators   │     │  Utilities     │
│               │     │                │
│ • environment │     │ • shell        │
└───────────────┘     └────────────────┘
```

## File Organization

```
mcp-dev-env-setup/
├── src/
│   ├── index.ts              # Entry point & mode router
│   ├── cli.ts                # CLI implementation
│   ├── mcp-server.ts         # MCP server implementation
│   │
│   ├── core/                 # Core business logic
│   │   ├── package-manager.ts    # OS/PM detection
│   │   └── tool-config.ts        # Tool definitions
│   │
│   ├── installers/          # Installation logic
│   │   └── unified-installer.ts  # Unified installer
│   │
│   ├── validators/          # Validation logic
│   │   └── environment-validator.ts
│   │
│   ├── utils/               # Utilities
│   │   ├── shell.ts             # Shell operations
│   │   └── check.ts             # Environment checks
│   │
│   └── __tests__/           # Unit tests
│       ├── package-manager.test.ts
│       ├── tool-config.test.ts
│       └── shell.test.ts
│
├── .github/
│   └── workflows/           # CI/CD pipelines
│       ├── ci.yml              # Continuous Integration
│       └── release.yml         # Release automation
│
├── dist/                    # Compiled output (generated)
│
└── [docs]                   # Documentation
```

## Data Flow

### CLI Mode Flow

```
User Input (Terminal)
    │
    ▼
┌──────────────────┐
│  CLI Parser      │
│  (Commander)     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Command Handler │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Business Logic  │
│  • Validators    │
│  • Installers    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Shell Execution │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  UI Formatting   │
│  (Chalk + Ora)   │
└────────┬─────────┘
         │
         ▼
Terminal Output (Colored)
```

### MCP Mode Flow

```
MCP Client (AI)
    │
    ▼
┌──────────────────┐
│  STDIO Transport │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  MCP Server      │
│  Request Handler │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Tool Router     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Business Logic  │
│  • Validators    │
│  • Installers    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Shell Execution │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Response Format │
│  (Markdown)      │
└────────┬─────────┘
         │
         ▼
MCP Client (Formatted)
```

## CI/CD Pipeline

```
Code Push / Tag
    │
    ▼
┌────────────────────────┐
│  GitHub Actions        │
│  Trigger               │
└────────┬───────────────┘
         │
         ├─ Push ──▶ ┌──────────────┐
         │            │  CI Workflow │
         │            │              │
         │            │ • Lint       │
         │            │ • Build      │
         │            │ • Test       │
         │            │ • Matrix     │
         │            └──────────────┘
         │
         └─ Tag ───▶ ┌──────────────┐
                     │  Release     │
                     │              │
                     │ • Build      │
                     │ • GitHub     │
                     │ • npm        │
                     │ • Binaries   │
                     └──────────────┘
```

## Deployment Options

```
┌─────────────────────────────────────────┐
│         Deployment Methods              │
└───────────┬─────────────────────────────┘
            │
    ┌───────┼────────┐
    ▼       ▼        ▼
┌────────┐ ┌─────┐ ┌──────────┐
│  npm   │ │ git │ │ binaries │
│ global │ │clone│ │ tarball  │
└────────┘ └─────┘ └──────────┘
    │         │         │
    ▼         ▼         ▼
┌─────────────────────────┐
│  devenv command         │
│  available globally     │
└─────────────────────────┘
```

## Key Design Decisions

### 1. Mode Detection

**Why**: Seamless user experience
- No configuration needed
- Backward compatible
- Clear separation

**Implementation**: Argument-based detection
```typescript
const isMCPMode = args.length === 0 || 
                  args.includes('--stdio') || 
                  args.includes('--mcp');
```

### 2. Shared Core Logic

**Why**: DRY principle, maintainability
- Single source of truth
- Consistent behavior
- Easy to test

**Implementation**: Both modes use same core modules
- `core/` - Business logic
- `installers/` - Installation
- `validators/` - Validation

### 3. Dynamic Imports

**Why**: Performance, bundle size
- CLI deps only loaded when needed
- Faster MCP startup
- Smaller MCP bundle

**Implementation**:
```typescript
if (isMCPMode) {
  // Direct import
  import { DevEnvSetupServer } from './mcp-server.js';
} else {
  // Dynamic import
  import('./cli.js');
}
```

### 4. CI Matrix Strategy

**Why**: Platform coverage, confidence
- Test on target platforms
- Multiple Node versions
- Early bug detection

**Implementation**: 2 OS × 2 Node = 4 combinations

## Extension Points

### Adding New CLI Command

1. Add to `src/cli.ts`:
```typescript
program
  .command('mycommand')
  .description('My command')
  .action(async () => {
    // Implementation
  });
```

### Adding New MCP Tool

1. Add to `TOOLS` array in `src/mcp-server.ts`
2. Add handler in switch statement

### Adding New Core Tool

1. Add to `TOOL_CONFIGS` in `src/core/tool-config.ts`
2. Available in both modes automatically

## Performance Considerations

### CLI Mode
- Fast startup (no MCP SDK loading)
- Immediate feedback
- Colored output for quick scanning

### MCP Mode
- No CLI deps loaded
- STDIO for low latency
- Efficient protocol

## Security Considerations

### Package Manager Operations
- Uses system package managers
- Requires appropriate permissions
- Validates inputs

### CI/CD
- Secrets managed in GitHub
- npm token protected
- No secrets in code

## Maintenance

### Regular Tasks
- Update dependencies
- Review CI logs
- Monitor npm downloads
- Respond to issues

### Release Process
1. Update version
2. Update changelog
3. Create tag
4. CI/CD handles rest

---

This architecture provides:
- ✅ Flexibility (two modes)
- ✅ Maintainability (shared core)
- ✅ Performance (dynamic loading)
- ✅ Quality (CI/CD)
- ✅ Extensibility (clear patterns)
