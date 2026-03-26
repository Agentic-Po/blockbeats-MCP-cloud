/**
 * BlockBeats MCP Server — Cloudflare Worker
 *
 * Implements the MCP Streamable HTTP transport (JSON-RPC over HTTP).
 * Users supply their own BlockBeats API key via the X-BlockBeats-Api-Key
 * request header — no server-side key is required or stored.
 *
 * MCP client config example:
 * {
 *   "mcpServers": {
 *     "blockbeats": {
 *       "type": "http",
 *       "url": "https://YOUR-WORKER.workers.dev/mcp",
 *       "headers": { "X-BlockBeats-Api-Key": "YOUR_KEY_HERE" }
 *     }
 *   }
 * }
 */

const BASE_URL = "https://api-pro.theblockbeats.info";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-BlockBeats-Api-Key, Mcp-Session-Id, Accept",
};

// ─── BlockBeats API ────────────────────────────────────────────────────────────

async function fetchApi(
  path: string,
  apiKey: string,
  params?: Record<string, string>
): Promise<unknown> {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }

  const res = await fetch(url.toString(), {
    headers: { "api-key": apiKey },
  });

  if (res.status === 401) throw new Error("API Key 无效或已过期，请检查密钥是否正确");
  if (res.status === 403) throw new Error("当前套餐无权访问该接口，请升级套餐");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const json = (await res.json()) as {
    status: number;
    message: string;
    data: unknown;
  };
  if (json.status !== 0) throw new Error(json.message || "API 返回错误");
  return json.data;
}

// ─── Tool call dispatcher ──────────────────────────────────────────────────────

async function callTool(
  name: string,
  a: Record<string, string | number | undefined>,
  apiKey: string
): Promise<unknown> {
  switch (name) {
    case "get_newsflash": {
      const category = (a.category as string) || "all";
      const params: Record<string, string> = {
        page: String(a.page ?? 1),
        size: String(a.size ?? 10),
        lang: (a.lang as string) || "cn",
      };
      if (category === "ai") {
        params.type = "ai";
        return fetchApi("/v1/newsflash", apiKey, params);
      }
      if (category === "all") return fetchApi("/v1/newsflash", apiKey, params);
      return fetchApi(`/v1/newsflash/${category}`, apiKey, params);
    }
    case "get_newsflash_24h":
      return fetchApi("/v1/newsflash/24h", apiKey, {
        lang: (a.lang as string) || "cn",
      });
    case "get_articles_24h":
      return fetchApi("/v1/article/24h", apiKey, {
        lang: (a.lang as string) || "cn",
      });
    case "get_articles": {
      const category = (a.category as string) || "all";
      const params: Record<string, string> = {
        page: String(a.page ?? 1),
        size: String(a.size ?? 10),
        lang: (a.lang as string) || "cn",
      };
      if (category === "all") return fetchApi("/v1/article", apiKey, params);
      return fetchApi(`/v1/article/${category}`, apiKey, params);
    }
    case "search_news":
      return fetchApi("/v1/search", apiKey, {
        name: String(a.keyword),
        page: String(a.page ?? 1),
        size: String(a.size ?? 10),
        lang: (a.lang as string) || "cn",
      });
    case "get_btc_etf_flow":
      return fetchApi("/v1/data/btc_etf", apiKey);
    case "get_daily_onchain_tx":
      return fetchApi("/v1/data/daily_tx", apiKey);
    case "get_ibit_fbtc_flow":
      return fetchApi("/v1/data/ibit_fbtc", apiKey);
    case "get_stablecoin_marketcap":
      return fetchApi("/v1/data/stablecoin_marketcap", apiKey);
    case "get_compliant_exchange_total":
      return fetchApi("/v1/data/compliant_total", apiKey);
    case "get_us_treasury_yield":
      return fetchApi("/v1/data/us10y", apiKey, {
        type: (a.timeframe as string) || "1D",
      });
    case "get_dxy_index":
      return fetchApi("/v1/data/dxy", apiKey, {
        type: (a.timeframe as string) || "1D",
      });
    case "get_m2_supply":
      return fetchApi("/v1/data/m2_supply", apiKey, {
        type: (a.timeframe as string) || "1Y",
      });
    case "get_bitfinex_long_positions":
      return fetchApi("/v1/data/bitfinex_long", apiKey, {
        symbol: (a.symbol as string) || "btc",
        type: (a.timeframe as string) || "1D",
      });
    case "get_contract_oi_data":
      return fetchApi("/v1/data/contract", apiKey, {
        dataType: (a.dataType as string) || "1D",
      });
    case "get_sentiment_indicator":
      return fetchApi("/v1/data/bottom_top_indicator", apiKey);
    case "get_top10_netflow":
      return fetchApi("/v1/data/top10_netflow", apiKey, {
        network: (a.network as string) || "solana",
      });
    case "get_exchange_rankings": {
      const params: Record<string, string> = {
        page: String(a.page ?? 1),
        size: String(a.size ?? 10),
      };
      if (a.exchange_name) params.name = String(a.exchange_name);
      return fetchApi("/v1/data/exchanges", apiKey, params);
    }
    default:
      throw new Error(`未知工具: ${name}`);
  }
}

// ─── Tool definitions (returned in tools/list) ────────────────────────────────

const TOOLS = [
  {
    name: "get_newsflash",
    description:
      "获取加密货币快讯，支持按分类（全部/重要/原创/首发/链上/融资/预测/AI）、页码和语言筛选",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          enum: ["all", "important", "original", "first", "onchain", "financing", "prediction", "ai"],
          default: "all",
          description:
            "快讯分类：all全部 | important重要 | original原创 | first首发 | onchain链上 | financing融资 | prediction预测市场 | ai(AI快讯)",
        },
        page: { type: "integer", minimum: 1, default: 1, description: "页码" },
        size: { type: "integer", minimum: 1, maximum: 50, default: 10, description: "每页数量（最大50）" },
        lang: {
          type: "string",
          enum: ["cn", "en", "cht", "vi", "ko", "ja", "th", "tr"],
          default: "cn",
          description: "语言：cn简体中文 | en英语 | cht繁体中文 | vi越南语 | ko韩语 | ja日语 | th泰语 | tr土耳其语",
        },
      },
    },
  },
  {
    name: "get_newsflash_24h",
    description: "获取过去 24 小时内的所有快讯（不支持分页，直接返回全量数据）",
    inputSchema: {
      type: "object",
      properties: {
        lang: {
          type: "string",
          enum: ["cn", "en", "cht", "vi", "ko", "ja", "th", "tr"],
          default: "cn",
          description: "语言：cn简体中文 | en英语 | cht繁体中文 | vi越南语 | ko韩语 | ja日语 | th泰语 | tr土耳其语",
        },
      },
    },
  },
  {
    name: "get_articles",
    description: "获取加密货币深度文章，支持按分类（全部/重要/原创）和页码筛选",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          enum: ["all", "important", "original"],
          default: "all",
          description: "文章分类：all全部 | important重要 | original原创",
        },
        page: { type: "integer", minimum: 1, default: 1, description: "页码" },
        size: { type: "integer", minimum: 1, maximum: 50, default: 10, description: "每页数量（最大50）" },
        lang: {
          type: "string",
          enum: ["cn", "en", "cht", "vi", "ko", "ja", "th", "tr"],
          default: "cn",
          description: "语言：cn简体中文 | en英语 | cht繁体中文 | vi越南语 | ko韩语 | ja日语 | th泰语 | tr土耳其语",
        },
      },
    },
  },
  {
    name: "get_articles_24h",
    description: "获取过去 24 小时内的文章（固定 50 条，不支持分页）",
    inputSchema: {
      type: "object",
      properties: {
        lang: {
          type: "string",
          enum: ["cn", "en", "cht", "vi", "ko", "ja", "th", "tr"],
          default: "cn",
          description: "语言：cn简体中文 | en英语 | cht繁体中文 | vi越南语 | ko韩语 | ja日语 | th泰语 | tr土耳其语",
        },
      },
    },
  },
  {
    name: "search_news",
    description: "按关键词搜索快讯和文章，支持分页",
    inputSchema: {
      type: "object",
      properties: {
        keyword: { type: "string", minLength: 1, description: "搜索关键词" },
        page: { type: "integer", minimum: 1, default: 1, description: "页码" },
        size: { type: "integer", minimum: 1, maximum: 100, default: 10, description: "每页数量（最大100）" },
        lang: {
          type: "string",
          enum: ["cn", "en", "cht", "vi", "ko", "ja", "th", "tr"],
          default: "cn",
          description: "语言：cn简体中文 | en英语 | cht繁体中文 | vi越南语 | ko韩语 | ja日语 | th泰语 | tr土耳其语",
        },
      },
      required: ["keyword"],
    },
  },
  {
    name: "get_btc_etf_flow",
    description: "获取 BTC ETF 净流入数据（机构资金）",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_daily_onchain_tx",
    description: "获取每日链上交易量数据",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_ibit_fbtc_flow",
    description: "获取 IBIT/FBTC 净流入数据",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_stablecoin_marketcap",
    description: "获取 USDT、USDC 等主流稳定币市值数据",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_compliant_exchange_total",
    description: "获取主流合规交易所总资产",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_us_treasury_yield",
    description: "获取美国 10Y 国债收益率，支持多时间维度",
    inputSchema: {
      type: "object",
      properties: {
        timeframe: {
          type: "string",
          enum: ["1D", "1W", "1M"],
          default: "1D",
          description: "时间维度：1D日 | 1W周 | 1M月",
        },
      },
    },
  },
  {
    name: "get_dxy_index",
    description: "获取美元指数（DXY），支持多时间维度",
    inputSchema: {
      type: "object",
      properties: {
        timeframe: {
          type: "string",
          enum: ["1D", "1W", "1M"],
          default: "1D",
          description: "时间维度：1D日 | 1W周 | 1M月",
        },
      },
    },
  },
  {
    name: "get_m2_supply",
    description: "获取全球 M2 货币供应量，支持多时间维度",
    inputSchema: {
      type: "object",
      properties: {
        timeframe: {
          type: "string",
          enum: ["3M", "6M", "1Y", "3Y"],
          default: "1Y",
          description: "时间维度：3M(3个月) | 6M(半年) | 1Y(1年) | 3Y(3年)",
        },
      },
    },
  },
  {
    name: "get_bitfinex_long_positions",
    description: "获取 Bitfinex 杠杆多头持仓数据，反映大户做多情绪",
    inputSchema: {
      type: "object",
      properties: {
        symbol: { type: "string", default: "btc", description: "币种符号，默认 btc" },
        timeframe: {
          type: "string",
          enum: ["h24", "1D", "1W", "1M"],
          default: "1D",
          description: "时间维度：h24(24小时近实时) | 1D日 | 1W周 | 1M月",
        },
      },
    },
  },
  {
    name: "get_contract_oi_data",
    description:
      "获取 Binance、Bybit、Hyperliquid 等主流合约平台未平仓合约（OI）数据",
    inputSchema: {
      type: "object",
      properties: {
        dataType: {
          type: "string",
          enum: ["1D", "1W", "1M", "3M", "6M", "12M"],
          default: "1D",
          description: "时间维度：1D日 | 1W周 | 1M月 | 3M | 6M | 12M年",
        },
      },
    },
  },
  {
    name: "get_sentiment_indicator",
    description:
      "获取抄底逃顶市场情绪指标（<20 潜在买入区间 / 20-80 中性 / >80 潜在卖出区间）",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_top10_netflow",
    description: "获取指定链上净流入最多的前十个代币",
    inputSchema: {
      type: "object",
      properties: {
        network: {
          type: "string",
          enum: ["solana", "base", "ethereum"],
          default: "solana",
          description: "区块链网络：solana | base | ethereum",
        },
      },
    },
  },
  {
    name: "get_exchange_rankings",
    description: "获取合约交易所成交量和未平仓合约排名",
    inputSchema: {
      type: "object",
      properties: {
        exchange_name: {
          type: "string",
          description: "交易所名称过滤（可选），如 Binance",
        },
        page: { type: "integer", minimum: 1, default: 1, description: "页码" },
        size: { type: "integer", minimum: 1, maximum: 100, default: 10, description: "每页数量" },
      },
    },
  },
];

// ─── JSON-RPC helpers ─────────────────────────────────────────────────────────

function jsonRpc(id: unknown, result: unknown): Response {
  return new Response(JSON.stringify({ jsonrpc: "2.0", id, result }), {
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function jsonRpcError(id: unknown, code: number, message: string): Response {
  return new Response(
    JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } }),
    { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
  );
}

// ─── Worker entry point ───────────────────────────────────────────────────────

export default {
  async fetch(request: Request): Promise<Response> {
    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    // Health check / info at root
    if (url.pathname === "/" || url.pathname === "") {
      return new Response(
        JSON.stringify({
          name: "blockbeats-mcp",
          version: "1.0.0",
          description: "BlockBeats MCP Server on Cloudflare Workers",
          endpoint: "/mcp",
          auth: "Pass your BlockBeats API key via the X-BlockBeats-Api-Key header",
        }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (url.pathname !== "/mcp") {
      return new Response("Not Found", { status: 404, headers: CORS_HEADERS });
    }

    // MCP clients do a GET first to check the endpoint exists
    if (request.method === "GET") {
      return new Response(
        JSON.stringify({ status: "ok", transport: "streamable-http" }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405, headers: CORS_HEADERS });
    }

    // Parse JSON-RPC body
    let body: {
      jsonrpc: string;
      method: string;
      params?: unknown;
      id?: unknown;
    };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return jsonRpcError(null, -32700, "Parse error");
    }

    const { method, params, id } = body;

    // ── Methods that do NOT need a BlockBeats API key ──────────────────────────

    if (method === "initialize") {
      return jsonRpc(id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "blockbeats-mcp", version: "1.0.0" },
      });
    }

    // Notification — no response body expected but return 200
    if (method === "notifications/initialized") {
      return new Response(null, { status: 200, headers: CORS_HEADERS });
    }

    if (method === "ping") {
      return jsonRpc(id, {});
    }

    if (method === "tools/list") {
      return jsonRpc(id, { tools: TOOLS });
    }

    // ── Methods that require the user's BlockBeats API key ────────────────────

    if (method === "tools/call") {
      const apiKey =
        request.headers.get("X-BlockBeats-Api-Key") ||
        request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");

      if (!apiKey) {
        return jsonRpcError(
          id,
          -32001,
          "Missing BlockBeats API key. Add X-BlockBeats-Api-Key to your MCP client headers. " +
            "Get a key at https://www.theblockbeats.info/"
        );
      }

      const { name, arguments: args = {} } = params as {
        name: string;
        arguments?: Record<string, string | number | undefined>;
      };

      try {
        const data = await callTool(
          name,
          args as Record<string, string | number | undefined>,
          apiKey
        );
        return jsonRpc(id, {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonRpc(id, {
          content: [{ type: "text", text: `错误：${message}` }],
          isError: true,
        });
      }
    }

    return jsonRpcError(id, -32601, `Method not found: ${method}`);
  },
};
