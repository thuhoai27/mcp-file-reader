# FileReader
FileReader is a Model Context Protocol (MCP) server that reads files from the local file system and provides their contents to AI models. This tool enables AI models to access and analyze text files from the local environment.

## Features
- **File Reading**: Reads text files from the local file system
- **UTF-8 Encoding**: Provides file contents in UTF-8 format
- **Error Handling**: Provides clear error messages for invalid paths
- **Absolute Paths**: Supports absolute file paths

## Installation
```json
{
    "mcpServers": {
        "file_reader": {
            "command": "npx",
            "args": [
                "-y",
                "mcp-file-reader"
            ]
        }
    }
}
```
