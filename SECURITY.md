# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability within personio-mcp-server, please send an email to Nikolai Bockholt. All security vulnerabilities will be promptly addressed.

Please do not disclose security vulnerabilities publicly until they have been addressed by the maintainers.

## Supported Versions

Only the latest version of personio-mcp-server is currently being supported with security updates.

## Processing of Personal Data

This server is not a generic API wrapper — it handles **personal data about
identifiable individuals**: employees (master data, attendance, absences, HR
documents) and job applicants (candidate profiles, applications, CVs).

Anyone deploying it is the **data controller** for that processing and is solely
responsible for its lawfulness. The maintainers have no access to and no
visibility into your deployment. The compliance obligations this implies are
summarised in the
[Data Protection & Compliance section of the README](README.md#️-data-protection--compliance)
— read it before pointing this server at a production Personio account.

Two properties deserve specific attention from a security perspective:

- **The MCP client is a data recipient.** Tool results, including personal data,
  are transmitted to whoever operates the LLM. Treat that provider as a
  recipient in your own documentation, and make sure a data processing
  agreement covers it.
- **Anyone who can prompt the client can read everything the credentials
  permit.** There is no per-user authorisation layer inside this server. Access
  control has to happen at the level of the MCP client and the API credentials.

## Security Best Practices

When using this MCP server:

1. **API Credentials**: Never commit your Personio API credentials to version control. Always use environment variables or a secure secrets management solution.

2. **Least Privilege**: Scope the Personio API credentials as narrowly as your setup allows. If you only need to read data, do not issue credentials that permit writes — several tools can create, modify or delete records.

3. **Access Control**: Limit access to the MCP server to trusted users and systems only.

4. **Regular Updates**: Keep the server and its dependencies up to date to benefit from security patches.

5. **Audit Logging**: Consider implementing audit logging for sensitive operations performed through the MCP server. Write and delete operations against a production HR system should be traceable to a person.

6. **Network Security**: Run the server in a secure network environment, preferably behind a firewall.

7. **Test in Isolation**: Exercise write and delete tools against a sandbox account or a throwaway employee record before using them in production. An LLM may invoke them based on misinterpreted instructions.

## Dependencies

This project uses several dependencies. We strive to keep these updated to minimize security risks. If you find any outdated dependencies with known vulnerabilities, please report them.
