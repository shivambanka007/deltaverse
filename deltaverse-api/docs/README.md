# Deltaverse API

Enterprise-level FastAPI application with automated CI/CD deployment to Google Cloud Run.

## Features

- **FastAPI Framework**: Modern, fast web framework for building APIs
- **Enterprise Structure**: Modular, scalable directory organization
- **Pip**: Dependency management with requirements.txt
- **Pydantic**: Data validation and settings management
- **Docker**: Multi-stage containerization optimized for Cloud Run
- **CI/CD**: Automated testing and deployment with Bitbucket Pipelines
- **Google Cloud Run**: Serverless deployment platform

## Project Structure

```
deltaverse-api/
├── .dockerignore
├── .gitignore
├── Dockerfile
├── bitbucket-pipelines.yml
├── requirements.txt
├── requirements-dev.txt
├── setup.py
├── README.md
└── app/
    ├── __init__.py
    ├── main.py
    ├── core/
    │   ├── __init__.py
    │   └── config.py
    ├── api/
    │   ├── __init__.py
    │   └── v1/
    │       ├── __init__.py
    │       ├── endpoints/
    │       │   ├── __init__.py
    │       │   └── items.py
    │       └── schemas/
    │           ├── __init__.py
    │           └── item.py
    └── tests/
        ├── __init__.py
        └── test_items.py
```

## Quick Start

### Local Development

1. **Create virtual environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. **Install dependencies**:
   ```bash
   pip3 install -r requirements-dev.txt
   ```

3. **Run the application**:
   ```bash
   uvicorn app.main:app --reload
   ```

4. **Access the API**:
   - API: http://localhost:8000
   - Interactive docs: http://localhost:8000/docs
   - Alternative docs: http://localhost:8000/redoc

### Testing

```bash
# Run tests
pytest

# Run tests with coverage
pytest --cov=app

# Run linting
black app/
isort app/
```

### Docker

```bash
# Build image
docker build -t deltaverse-api .

# Run container
docker run -p 8000:8000 deltaverse-api
```

## API Endpoints

### Items API (`/api/v1/items`)

- `GET /api/v1/items/` - List all items
- `GET /api/v1/items/{id}` - Get item by ID
- `POST /api/v1/items/` - Create new item
- `PUT /api/v1/items/{id}` - Update item
- `DELETE /api/v1/items/{id}` - Delete item

### Health Check

- `GET /` - Root endpoint
- `GET /health` - Health check endpoint

## Configuration

The application uses environment variables for configuration:

- `APP_NAME`: Application name (default: "Deltaverse API")
- `DEBUG`: Debug mode (default: False)
- `PORT`: Server port (default: 8000)
- `ENVIRONMENT`: Environment name (default: "development")

## Deployment

### Google Cloud Run

The application is configured for automatic deployment to Google Cloud Run using Bitbucket Pipelines.

#### Required Repository Variables

Set these variables in your Bitbucket repository settings:

- `GCP_PROJECT_ID`: Your Google Cloud Project ID
- `GCP_SA_KEY`: Base64 encoded service account key JSON
- `GAR_LOCATION`: Google Artifact Registry location (e.g., us-central1)
- `GAR_REPOSITORY`: Artifact Registry repository name
- `GAR_IMAGE_NAME`: Docker image name
- `CLOUD_RUN_SERVICE_NAME`: Cloud Run service name
- `CLOUD_RUN_REGION`: Cloud Run deployment region

#### Service Account Permissions

The service account needs the following roles:
- Artifact Registry Writer
- Cloud Run Admin
- Service Account User

## Development

### Code Style

The project uses:
- **Black** for code formatting
- **isort** for import sorting
- **Flake8** for linting

### Testing

- **pytest** for unit testing
- **httpx** for async HTTP testing
- Test coverage reporting

## License

This project is licensed under the MIT License.