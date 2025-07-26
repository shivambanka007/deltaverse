# Deltaverse API

A FastAPI-based backend for the Deltaverse platform with AI integration and MCP support.

## Documentation

For detailed documentation, setup instructions, and API reference, please see the [docs](./docs/) directory:

- [Main Documentation](./docs/README.md)

## Quick Start

1. Create and activate virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements-dev.txt
   ```

3. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```

The API will be available at `http://localhost:8000`
