# SubProbe
> JS-powered crawler for hidden endpoints & internal subdomains

<p align="center">
  <img src="https://i.imgur.com/aJPgEZ9.png" width="250" alt="SubProbe logo"/>
</p>

<p align="center">
  <img src="https://img.shields.io/github/license/devploit/SubProbe?style=flat-square" alt="License">
  <img src="https://img.shields.io/github/stars/devploit/SubProbe?style=flat-square" alt="Stars">
</p>

<p align="center">
  <b>Extract hidden endpoints and internal subdomains from JavaScript files through semantic analysis</b>
</p>

SubProbe is a powerful JavaScript-aware web crawler designed for security researchers and penetration testers. It discovers hidden endpoints, APIs, and subdomains by analyzing JavaScript files within web applications — revealing potential attack surfaces that traditional crawlers and subdomain enumeration tools miss.

## 🚀 Features

- **Deep JavaScript Analysis**: Parses and extracts endpoints from **JavaScript files** (semantic analysis)
- **Recursive Crawling**: Supports multi-level crawling to discover deeper JS resources
- **External Sources**: Collects additional endpoints from:
  - robots.txt
  - sitemap.xml
  - Wayback Machine
- **Endpoint Verification**: Tests endpoints to verify they're accessible
- **Status Filtering**: Filter results by HTTP status codes
- **Export Options**: Save results as JSON, CSV, or plain text files

## 📋 Installation

```bash
# Clone the repository
git clone https://github.com/devploit/SubProbe.git
cd SubProbe
npm install

# Make it executable
npm link
```

After running the above commands, you can use `subprobe` directly from your terminal.

## 📊 Command Options

| Option | Description |
|--------|-------------|
| `--depth <number>` | Recursive scan depth for internal links (default 0) |
| `--filter-status <codes>` | Filter by status codes. Supports exact (200), ranges (400-410), and groups (4xx) |
| `-o, --out <file>` | Export results to JSON, CSV, or plain text (determined by file extension) |
| `--probe` | Check if endpoints respond (via HTTP status codes) |
| `--wayback` | Include Wayback Machine results |
| `--silent` | Only show discovered endpoints without progress information |
| `--no-color` | Disable colored output |

## 📝 Example Output

Running `subprobe https://example.com --probe --wayback` might produce output like this:

```
🚀 Starting SubProbe on https://example.com

[12:34:56] 🕷️  Starting crawl (depth: 0)
[12:34:57] 🎯 Crawling depth 0 (1 URLs)
[12:35:01] 📂 Collecting from robots.txt & sitemap.xml
[12:35:05] 🕚 Collecting from Wayback...
[12:35:12] 🔌 Probing 42 endpoints...

✅ Analysis complete - Summary:
    - URLs analyzed: 1
    - JS files analyzed: 3/3
    - Endpoints found: 42

[12:35:30] 🔍 Found 42 endpoints:

🟩 https://example.com/api/v1/users ✅ [200]
🟩 https://example.com/api/v1/products ✅ [200]
🟩 https://example.com/api/v1/cart ✅ [200]
🟩 https://example.com/api/v1/checkout 🔒 [401]
🟦 https://api.example.com/v2/products ✅ [200]
🟥 https://cdn.example.net/assets/main.js ✅ [200]
🟥 https://analytics.example-tracker.com/collect ❌ [404]
🕓 https://example.com/legacy/api/users ❌ [404]
🕓 https://example.com/beta/graphql ✅ [200]
🗺️ https://example.com/sitemap/products.xml ✅ [200]
🤖 https://example.com/admin/login.php ❌ [404]
```

The output shows different types of endpoints with their status:
- 🟩 Relative paths from the same domain
- 🟦 Internal subdomains
- 🟥 External domains referenced in code
- 🕓 Historical endpoints from Wayback Machine
- 🗺️ Endpoints found in sitemap.xml
- 🤖 Endpoints found in robots.txt

Status codes are shown when using `--probe`:
- ✅ 2xx: Success
- 🔁 3xx: Redirection
- 🔒 401/403: Authentication required
- ❌ 4xx: Client error
- 💥 5xx: Server error

## 🔍 How It Works

SubProbe uses a multi-stage approach to discover hidden endpoints:

1. **Crawling**: SubProbe behaves like a lightweight crawler, starting from the target URL and recursively following links up to the specified depth to discover more JavaScript files and internal pages.
2. **JS Collection**: Extracts and downloads JavaScript files from HTML source
3. **Semantic Analysis**: Parses JS files using AST (Abstract Syntax Tree) analysis to find:
   - Fetch API calls
   - Axios requests
   - XMLHttpRequest URLs
   - Hardcoded API endpoints
4. **External Data**: Gathers additional endpoints from robots.txt, sitemap.xml, and optionally Wayback Machine
5. **Endpoint Verification**: If enabled, probes discovered endpoints to check their HTTP status
6. **Results Display**: Presents organized results with color-coded endpoint types and status codes

## 🌐 Use Cases

- Finding hidden API endpoints during penetration tests
- Discovering forgotten or legacy endpoints that might be vulnerable
- Identifying internal subdomains referenced in JavaScript
- Mapping the full attack surface of a web application
- Reconnaissance phase of bug bounty hunting

## 👨‍💻 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/devploit">devploit</a>
</p>
