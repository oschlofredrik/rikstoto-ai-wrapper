# Security Policy

## Overview
This document outlines security best practices and guidelines for the Rikstoto AI Model Testing Platform.

## Sensitive Information Handling

### API Tokens
- **NEVER** commit API tokens or credentials to version control
- Store all sensitive credentials in `.env` files
- Ensure `.env` is listed in `.gitignore`
- Use environment variables for all API keys and tokens
- Rotate tokens regularly according to your organization's security policy

### Hugging Face Token Management
- Obtain tokens from: https://huggingface.co/settings/tokens
- Use read-only tokens when possible
- Limit token scope to only necessary permissions
- Store tokens securely in environment variables:
  ```bash
  HUGGINGFACE_TOKEN=hf_xxxxxxxxxxxxx
  ```

## Security Best Practices

### Backend Security
1. **Input Validation**
   - All user inputs are validated using Pydantic models
   - JSON data is parsed safely with error handling
   - Model names are validated against allowlist

2. **CORS Configuration**
   - Currently configured for local development (`localhost:3001`)
   - **IMPORTANT**: Update CORS settings for production deployment
   - Restrict origins to specific domains in production

3. **Rate Limiting**
   - Consider implementing rate limiting for production
   - Protect against API abuse and DoS attacks

4. **Error Handling**
   - Avoid exposing sensitive information in error messages
   - Log errors securely without exposing tokens or internal paths

### Frontend Security
1. **API Communication**
   - Use HTTPS in production environments
   - Validate all API responses
   - Implement proper error boundaries

2. **Content Security**
   - Sanitize markdown content before rendering
   - Validate JSON input on client side
   - Implement CSP headers in production

### Docker Security
1. **Container Security**
   - Run containers with minimal privileges
   - Don't run as root user in production
   - Keep base images updated

2. **Network Security**
   - Use Docker networks to isolate services
   - Expose only necessary ports
   - Use secrets management for sensitive data

## Vulnerability Reporting

If you discover a security vulnerability, please:
1. **DO NOT** create a public GitHub issue
2. Contact the Rikstoto security team immediately
3. Provide detailed information about the vulnerability
4. Allow time for the issue to be resolved before public disclosure

## Security Checklist for Deployment

- [ ] All API tokens stored in environment variables
- [ ] `.env` file is not committed to repository
- [ ] CORS configured for production domains only
- [ ] HTTPS enabled for all endpoints
- [ ] Input validation implemented on all endpoints
- [ ] Error messages don't expose sensitive information
- [ ] Docker containers run with minimal privileges
- [ ] Regular security updates applied to dependencies
- [ ] Rate limiting implemented
- [ ] Logging configured without sensitive data exposure

## Compliance

Ensure compliance with:
- GDPR requirements for data handling
- Norwegian data protection regulations
- Rikstoto's internal security policies

## Dependencies Security

Regularly update dependencies to patch security vulnerabilities:

```bash
# Backend
pip list --outdated
pip install --upgrade [package]

# Frontend
npm audit
npm audit fix
```

## Contact

For security concerns, contact the Rikstoto IT Security team.

---
Last Updated: 2024
Version: 1.0