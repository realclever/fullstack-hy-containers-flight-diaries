# Flight Diaries

Containerized development and production environments for the Flight Diaries app.

## Development

Start the development environment:

```
docker compose -f docker-compose.dev.yml up --build
```

## Production

Start the production environment:

```
docker compose up --build
```

The app is available at http://localhost:8080.
