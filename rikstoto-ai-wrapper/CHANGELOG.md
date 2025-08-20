# Changelog

All notable changes to the Rikstoto AI Model Testing Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Documentation improvements:
  - LICENSE file (MIT)
  - SECURITY.md with security guidelines
  - CONTRIBUTING.md with contribution guidelines
  - .env.example template file
  - This CHANGELOG.md file
  - Comprehensive docstrings in Python code

### To Do
- Add unit tests for backend API
- Add integration tests
- Implement authentication system
- Add model response caching
- Implement batch processing
- Add export functionality for results
- Add model comparison features
- Implement rate limiting
- Add logging system
- Create admin dashboard

## [1.0.0] - 2024-01-15

### Added
- Initial release of Rikstoto AI Model Testing Platform
- FastAPI backend with Hugging Face Inference API integration
- React frontend with TypeScript and Material-UI
- Support for multiple text generation models:
  - GPT-2
  - DistilGPT-2
  - DialoGPT Small
  - GPT-Neo 125M
  - FLAN-T5 Small
  - Google Gemma 2B
  - DeepSeek R1 1.5B
  - Microsoft Phi-4
- JSON input editor with syntax highlighting (Monaco Editor)
- Markdown support for system prompts with `{{json}}` variable substitution
- Adjustable generation parameters:
  - Temperature
  - Top-p
  - Top-k
  - Max length
- Real-time output display with markdown rendering
- Docker support for containerized deployment
- CORS configuration for local development
- Auto-generated API documentation at /docs endpoint

### Changed
- Migrated from local model loading to Hugging Face Inference API
- Changed frontend port from 3000 to 3001 to avoid conflicts
- Optimized model loading with cloud-based inference

### Fixed
- Resolved PyTorch memory issues with large models
- Fixed CORS configuration for frontend-backend communication
- Addressed permission issues with cache directory

### Security
- Implemented environment variable management for API tokens
- Added input validation using Pydantic models
- Secured API endpoints with proper error handling

## [0.9.0] - 2024-01-01 (Beta)

### Added
- Beta version with basic functionality
- Local model loading support (deprecated)
- Basic UI with form inputs
- Simple text generation capability

### Known Issues
- Memory issues with large models
- Cache permission problems
- Limited model options

---

## Version Guidelines

- **Major version (X.0.0)**: Breaking changes or major feature additions
- **Minor version (0.X.0)**: New features, backwards compatible
- **Patch version (0.0.X)**: Bug fixes and minor improvements

## Release Process

1. Update version in package.json and requirements.txt
2. Update CHANGELOG.md with release notes
3. Create git tag: `git tag -a v1.0.0 -m "Release version 1.0.0"`
4. Push tag: `git push origin v1.0.0`
5. Create GitHub release with changelog excerpt

## Support

For questions about changes or version compatibility, contact the Rikstoto development team.

---
Last Updated: 2024-01-15
Current Version: 1.0.0