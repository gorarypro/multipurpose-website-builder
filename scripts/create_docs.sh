#!/usr/bin/env bash
# scripts/create_docs.sh
# Creates docs and README

set -euo pipefail

ROOT_DIR="${1:-multipurpose-website-builder}"
echo "📚 [docs] Using root: $ROOT_DIR"

DOCS_DIR="$ROOT_DIR/docs"
mkdir -p "$DOCS_DIR"

########################################
# PRD
########################################
cat > "$DOCS_DIR/1-PRD.md" << 'EOF'
# ✅ Multipurpose Website Builder  
## Product Requirements Document (PRD) – Summary

### 1. Executive Summary
The **Multipurpose Website Builder** is a no-code, modular website-generation platform that combines:

- Blogger or WordPress/WooCommerce as content and product sources  
- Google Apps Script as the backend engine  
- Google Sheets for configuration, translations, and entries  
- A dynamic Blogger theme as the front-end layer  

It lets users create business websites, portfolios, e-commerce stores, landing pages, and booking systems with **multi-language**, **multi-currency**, and **component-level control**.
EOF

########################################
# Roadmap
########################################
cat > "$DOCS_DIR/2-Roadmap.md" << 'EOF'
# 🗺️ Multipurpose Website Builder — Roadmap

(Trimmed summary – extend as needed.)
EOF

########################################
# Architecture (with Mermaid)
########################################
cat > "$DOCS_DIR/3-Architecture.md" << 'EOF'
# 🏗️ Multipurpose Website Builder — Architecture

## Mermaid Diagram

```mermaid
flowchart TD
    Admin[Admin / Site Owner] -->|iframe| Builder[Builder Wizard (GAS Web App)]
    Builder -->|save/load config| GAS[Google Apps Script Backend]

    GAS -->|read/write| Sheets[(Google Sheets\nSettings / Entries / TextMapping)]
    GAS -->|fetch content| Blogger[Blogger API]
    GAS -->|fetch content| WordPress[WordPress / WooCommerce API]

    GAS -->|generate theme.xml| Theme[Theme Template Engine]
    Theme --> BloggerBlog[Blogger Blog Theme]

    Visitor[Site Visitor] -->|HTTP| BloggerBlog
    BloggerBlog -->|JSONP/API| GAS
