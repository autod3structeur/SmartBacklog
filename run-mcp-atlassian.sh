#!/bin/bash
set -a
source /Users/vitt/phi/cours/info-systems-design/smartbacklog/.env
set +a
uvx mcp-atlassian "$@"
