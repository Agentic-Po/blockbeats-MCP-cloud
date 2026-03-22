# blockbeats-mcp

**BlockBeats MCP Server** — A crypto data gateway for AI assistants, powered by the BlockBeats Pro API.

Covers real-time newsflashes, in-depth articles, on-chain metrics, BTC ETF flows, stablecoin data, macro indicators, derivatives market data, and more.

[![npm version](https://img.shields.io/npm/v/blockbeats-mcp)](https://www.npmjs.com/package/blockbeats-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Prerequisites

- Node.js 18+
- BlockBeats API Key ([Apply here](https://www.theblockbeats.info/))

---

## Installation

```bash
npm install -g blockbeats-mcp
```

---

## Integration

### Claude Desktop

Edit the config file:
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "blockbeats": {
      "command": "npx",
      "args": ["-y", "blockbeats-mcp"],
      "env": {
        "BLOCKBEATS_API_KEY": "your_api_key"
      }
    }
  }
}
```

Restart Claude Desktop to apply.

---

### Cursor

Open **Cursor → Settings → MCP**, add:

```json
{
  "mcpServers": {
    "blockbeats": {
      "command": "npx",
      "args": ["-y", "blockbeats-mcp"],
      "env": {
        "BLOCKBEATS_API_KEY": "your_api_key"
      }
    }
  }
}
```

---

### Windsurf

Edit `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "blockbeats": {
      "command": "npx",
      "args": ["-y", "blockbeats-mcp"],
      "env": {
        "BLOCKBEATS_API_KEY": "your_api_key"
      }
    }
  }
}
```

---

### Cline (VS Code)

Open **VS Code → Cline panel → MCP Servers → Add**:

```json
{
  "blockbeats": {
    "command": "npx",
    "args": ["-y", "blockbeats-mcp"],
    "env": {
      "BLOCKBEATS_API_KEY": "your_api_key"
    }
  }
}
```

---

### OpenClaw

Add to OpenClaw's MCP config:

```json
{
  "mcpServers": {
    "blockbeats": {
      "command": "npx",
      "args": ["-y", "blockbeats-mcp"],
      "env": {
        "BLOCKBEATS_API_KEY": "your_api_key"
      }
    }
  }
}
```

---

### Programmatic Usage (Node.js / TypeScript)

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "npx",
  args: ["-y", "blockbeats-mcp"],
  env: { BLOCKBEATS_API_KEY: "your_api_key" },
});

const client = new Client({ name: "my-app", version: "1.0.0" }, { capabilities: {} });
await client.connect(transport);

const result = await client.callTool({
  name: "get_newsflash",
  arguments: { category: "important", size: 10 },
});
console.log(result);
```

---

## Available Tools

| Tool | Description |
|------|-------------|
| `get_newsflash` | Newsflash list — filter by category: `all` / `important` / `original` / `first-report` / `on-chain` / `funding` / `prediction` / `AI` |
| `get_newsflash_24h` | All newsflashes from the past 24 hours (no pagination) |
| `get_articles` | Article list — filter by type: `all` / `important` / `original` |
| `get_articles_24h` | Articles from the past 24 hours (fixed 50 items, no pagination) |
| `search_news` | Full-text keyword search across news and articles, with pagination |
| `get_btc_etf_flow` | BTC spot ETF daily net inflow data |
| `get_ibit_fbtc_flow` | IBIT / FBTC individual fund net inflow |
| `get_daily_onchain_tx` | Daily on-chain transaction volume |
| `get_stablecoin_marketcap` | Total stablecoin market cap |
| `get_compliant_exchange_total` | Aggregated assets across compliant exchanges |
| `get_us_treasury_yield` | US Treasury yield curve data |
| `get_dxy_index` | US Dollar Index (DXY) |
| `get_m2_supply` | Global M2 money supply |
| `get_bitfinex_long_positions` | Bitfinex BTC long position data |
| `get_contract_oi_data` | Open interest by derivatives platform |
| `get_sentiment_indicator` | Market buy/sell sentiment indicator |
| `get_top10_netflow` | Top 10 tokens by on-chain net inflow |
| `get_exchange_rankings` | Derivatives exchange ranking by volume |

---

## Example Prompts

Once connected, ask naturally:

```
How much did BTC ETF inflow today?
What are the latest important crypto newsflashes?
Search for Solana-related news this week.
Is the current macro environment favorable for entering the market?
Which tokens are seeing the largest on-chain inflows?
What is the current market sentiment — bullish or bearish?
```

---

## License

MIT
