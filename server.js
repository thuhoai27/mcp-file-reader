#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// ------------------------------------------------------------

// MCP 서버 설정
const server = new Server(

    // 서버의 이름과 버전
    { name: "file-reader", version: "0.0.1" },

    // 서버의 기능
    { capabilities: { tools: {} } }
);

// 도구들의 정의
const tools = {

    // 도구의 이름
    read_file: {

        // 도구의 설명 (AI가 도구를 선택함에 있어서 이 설명을 참고합니다)
        description: "Read file contents",


        // 도구의 재료 (도구를 사용함에 있어서 어떤 재료가 필요한지와 그 설명을 담아줍니다)
        schema: z.object({
            path: z.string().describe("Absolute path to the file to read. e.g. /Users/user/Desktop/test.txt")
        }),

        // 도구의 핸들러
        // 재료가 잘 준비되었는지 확인하고 재료를 통해 일을 수행하고 결과를 내는 작동을 합니다.
        async handler(args) {
            const parsed = this.schema.safeParse(args);
            if (!parsed.success) { // 재료가 잘 준비되지 않았다면 에러를 발생시킵니다.
                throw new Error(`Invalid arguments: ${parsed.error}`);
            }
            const content = await fs.readFile(parsed.data.path, "utf-8"); // 재료를 통해 일을 수행하고 결과를 내는 작동을 합니다.
            return { content: [{ type: "text", text: content }] }; // 결과를 내는 작동을 합니다.
        }
    }
};

// ------------------------------------------------------------

// 도구 목록 핸들러
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: Object.entries(tools).map(([name, tool]) => ({
            name,
            description: tool.description,
            inputSchema: zodToJsonSchema(tool.schema)
        }))
    };
});

// 도구 호출 핸들러
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        const { name, arguments: args } = request.params;
        const tool = tools[name];

        if (!tool) {
            throw new Error(`Unknown tool: ${name}`);
        }

        return await tool.handler(args);
    } catch (error) {
        return {
            content: [{ type: "text", text: `Error: ${error.message}` }],
            isError: true
        };
    }
});

// 서버 시작
const transport = new StdioServerTransport();
await server.connect(transport);
