# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability within personio-mcp-server, please send an email to Nikolai Bockholt. All security vulnerabilities will be promptly addressed.

Please do not disclose security vulnerabilities publicly until they have been addressed by the maintainers.

## Supported Versions

Only the latest version of personio-mcp-server is currently being supported with security updates.

## Security Best Practices

When using this MCP server:

1. **API Credentials**: Never commit your Personio API credentials to version control. Always use environment variables or a secure secrets management solution.

2. **Access Control**: Limit access to the MCP server to trusted users and systems only.

3. **Regular Updates**: Keep the server and its dependencies up to date to benefit from security patches.

4. **Audit Logging**: Consider implementing audit logging for sensitive operations performed through the MCP server.

5. **Network Security**: Run the server in a secure network environment, preferably behind a firewall.

## Dependencies

This project uses several dependencies. We strive to keep these updated to minimize security risks. If you find any outdated dependencies with known vulnerabilities, please report them.
