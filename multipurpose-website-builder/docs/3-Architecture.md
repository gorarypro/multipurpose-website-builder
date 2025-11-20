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
