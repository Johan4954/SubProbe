# SubProbe: Your JavaScript-Aware Crawler for Security Research

![SubProbe Logo](https://img.shields.io/badge/SubProbe-🚀-blue)

Welcome to **SubProbe**, a powerful tool designed for security researchers and bug bounty hunters. This lightweight and fast crawler specializes in extracting hidden endpoints and internal subdomains through both static and semantic analysis of JavaScript files. Whether you are conducting a penetration test or performing reconnaissance, SubProbe equips you with the necessary capabilities to uncover vulnerabilities in web applications.

## Table of Contents

- [Features](#features)
- [Topics](#topics)
- [Installation](#installation)
- [Usage](#usage)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Releases](#releases)

## Features

- **JavaScript Awareness**: SubProbe understands JavaScript and can analyze its structure to find hidden endpoints.
- **Fast and Lightweight**: Designed for efficiency, SubProbe runs quickly without consuming excessive resources.
- **Static and Semantic Analysis**: Uses both methods to ensure comprehensive endpoint discovery.
- **Subdomain Enumeration**: Automatically discovers internal subdomains that might be overlooked.
- **Robust Toolset**: Includes features for analyzing `robots.txt`, sitemaps, and more.

## Topics

SubProbe covers a wide range of topics relevant to web security:

- ast-analysis
- bugbounty
- crawler
- endpoint-discovery
- infosec
- javascript
- nodejs
- pentest
- reconnaissance
- robots-txt
- security
- sitemap
- subdomain-enumeration
- tool
- wayback-machine
- web-security

## Installation

To get started with SubProbe, follow these simple steps:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Johan4954/SubProbe.git
   ```

2. **Navigate to the Directory**:
   ```bash
   cd SubProbe
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

Now you are ready to use SubProbe!

## Usage

Using SubProbe is straightforward. Here’s how to run it:

```bash
node subprobe.js <target-url>
```

Replace `<target-url>` with the URL of the website you want to analyze. 

### Command-Line Options

- `--output <filename>`: Save the results to a specified file.
- `--verbose`: Enable detailed logging of the process.
- `--help`: Display help information about the commands and options.

## Examples

### Basic Usage

To scan a website for hidden endpoints:

```bash
node subprobe.js https://example.com
```

### Save Results

To save the results to a file named `results.json`:

```bash
node subprobe.js https://example.com --output results.json
```

### Verbose Mode

To run SubProbe in verbose mode for detailed logging:

```bash
node subprobe.js https://example.com --verbose
```

## Contributing

We welcome contributions to SubProbe! If you would like to help improve the tool, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Push your branch to your fork.
5. Submit a pull request with a description of your changes.

Please ensure your code adheres to our coding standards and includes appropriate tests.

## License

SubProbe is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For questions or support, feel free to reach out:

- **Author**: Johan
- **Email**: johansupport@example.com

## Releases

You can find the latest releases of SubProbe [here](https://github.com/Johan4954/SubProbe/releases). Download the appropriate version and execute it to get started.

For more information, please check the "Releases" section.

---

With SubProbe, you have a powerful ally in your security research and bug bounty hunting efforts. Start uncovering hidden endpoints and internal subdomains today!