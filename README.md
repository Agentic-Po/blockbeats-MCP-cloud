# blockbeats-mcp

BlockBeats Pro API MCP Server — provides AI assistants with crypto news, articles, search, and on-chain market data query capabilities.

## Installation

```bash
npm install -g blockbeats-mcp
```

## Prerequisites

- Node.js 18+
- BlockBeats API Key ([Apply here](https://www.theblockbeats.info/))

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

### Cursor

Open Cursor → Settings → MCP, add:

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

### Cline (VS Code Extension)

Open VS Code → Cline panel → MCP Servers → Add:

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

### Programmatic Usage (Node.js / TypeScript)

Call directly via the MCP Client SDK:

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
| `get_newsflash` | News flash list (all / important / original / first-report / on-chain / funding / prediction / AI) |
| `get_articles` | Article list (all / important / original) |
| `search_news` | Keyword search |
| `get_btc_etf_flow` | BTC ETF net inflow |
| `get_daily_onchain_tx` | Daily on-chain transaction volume |
| `get_ibit_fbtc_flow` | IBIT / FBTC net inflow |
| `get_stablecoin_marketcap` | Stablecoin market cap |
| `get_compliant_exchange_total` | Total assets of compliant exchanges |
| `get_us_treasury_yield` | US Treasury yield |
| `get_dxy_index` | US Dollar Index (DXY) |
| `get_m2_supply` | Global M2 money supply |
| `get_bitfinex_long_positions` | Bitfinex long positions |
| `get_contract_oi_data` | Contract platform open interest data |
| `get_sentiment_indicator` | Buy/sell sentiment indicator |
| `get_top10_netflow` | Top 10 tokens by on-chain net inflow |
| `get_exchange_rankings` | Derivatives exchange rankings |

---

## Usage Examples

Once configured, chat naturally:

```
How much did BTC ETF inflow today?
What are the latest important news flashes?
Search for Solana-related news
Is the current macro environment good for entering the market?
Where is on-chain capital flowing?
```

## License

MIT
