# blockbeats-mcp-cloud

**BlockBeats MCP Server — Cloudflare Worker Edition**

A zero-install, serverless MCP gateway for AI assistants powered by the [BlockBeats Pro API](https://www.theblockbeats.info/).
Covers real-time newsflashes, in-depth articles, on-chain metrics, BTC ETF flows, stablecoin data, macro indicators, derivatives market data, and more.

[![npm version](https://img.shields.io/npm/v/blockbeats-mcp)](https://www.npmjs.com/package/blockbeats-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## What's Different from the Original

This is a fork of [blockbeats-mcp](https://www.npmjs.com/package/blockbeats-mcp) with one major addition: **a Cloudflare Worker that runs the MCP server in the cloud**, so no one needs to install Node.js or run anything locally.

| Feature | Original (`blockbeats-mcp`) | This Fork (Cloudflare Worker) |
|---|---|---|
| **Runtime** | Local Node.js process | Cloudflare Workers (serverless, global edge) |
| **Installation** | `npm install -g blockbeats-mcp` required | **Zero install** — connect via URL |
| **Transport** | stdio (local only) | HTTP (Streamable MCP) |
| **API Key** | Set as `env` in client config | Passed as a request header (`X-BlockBeats-Api-Key`) |
| **Key storage** | Stored in local config file | Never stored on the server — sent per-request |
| **Availability** | Only when your machine is on | Always-on, globally distributed |
| **New tools** | 16 tools | **18 tools** (+`get_newsflash_24h`, `get_articles_24h`) |

---

## Quickstart — No Install Needed

The server is **already deployed** and running at:

```
https://blockbeats-mcp.pochu1215.workers.dev/mcp
```

Just point your MCP client at that URL and pass your BlockBeats API key as a header. That's it.

> **Get an API key:** [https://www.theblockbeats.info/](https://www.theblockbeats.info/)

---

## Integration

### Claude Desktop

Edit the config file:
- **Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "blockbeats": {
      "type": "http",
      "url": "https://blockbeats-mcp.pochu1215.workers.dev/mcp",
      "headers": {
        "X-BlockBeats-Api-Key": "YOUR_API_KEY"
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
      "type": "http",
      "url": "https://blockbeats-mcp.pochu1215.workers.dev/mcp",
      "headers": {
        "X-BlockBeats-Api-Key": "YOUR_API_KEY"
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
      "type": "http",
      "url": "https://blockbeats-mcp.pochu1215.workers.dev/mcp",
      "headers": {
        "X-BlockBeats-Api-Key": "YOUR_API_KEY"
      }
    }
  }
}
```

---

### Test with curl

No client needed — verify it works in seconds:

```bash
# Health check (no API key required)
curl https://blockbeats-mcp.pochu1215.workers.dev/

# List all 18 available tools
curl -X POST https://blockbeats-mcp.pochu1215.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# Call a tool (API key required)
curl -X POST https://blockbeats-mcp.pochu1215.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -H "X-BlockBeats-Api-Key: YOUR_API_KEY" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_newsflash","arguments":{"category":"important","size":5}}}'
```

---

## Available Tools

| Tool | Description |
|------|-------------|
| `get_newsflash` | Newsflash list — filter by category: `all` / `important` / `original` / `first` / `onchain` / `financing` / `prediction` / `ai` |
| `get_newsflash_24h` | ⭐ **New** — All newsflashes from the past 24 hours (no pagination) |
| `get_articles` | Article list — filter by type: `all` / `important` / `original` |
| `get_articles_24h` | ⭐ **New** — Articles from the past 24 hours (fixed 50 items, no pagination) |
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

## Self-Hosting (Deploy Your Own)

If you'd prefer to run your own instance on Cloudflare Workers:

**Prerequisites:** Node.js 18+, a [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier works)

```bash
git clone https://github.com/Agentic-Po/blockbeats-MCP-cloud.git
cd blockbeats-MCP-cloud
npm install

# Login to Cloudflare
npx wrangler login

# Deploy
npx wrangler deploy
```

Your worker will be live at `https://blockbeats-mcp.<your-subdomain>.workers.dev/mcp`.
No secrets to configure — users supply their own API key via the `X-BlockBeats-Api-Key` header.

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
