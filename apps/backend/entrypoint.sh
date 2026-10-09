#!/bin/sh
set -e

echo "▶ Starting application..."
exec bun dist/src/main.js
