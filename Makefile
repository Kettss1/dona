.PHONY: help db-start db-stop db-restart db-logs db-shell migrate dev dev-web dev-api install clean

help:
	@echo "Dona - Available Commands"
	@echo ""
	@echo "Database:"
	@echo "  make db-start    Start PostgreSQL container"
	@echo "  make db-stop     Stop PostgreSQL container"
	@echo "  make db-restart  Restart PostgreSQL container"
	@echo "  make db-logs     View PostgreSQL logs"
	@echo "  make db-shell    Open psql shell"
	@echo "  make migrate     Run database migrations"
	@echo ""
	@echo "Development:"
	@echo "  make install     Install dependencies"
	@echo "  make dev         Run both web and api"
	@echo "  make dev-web     Run web only"
	@echo "  make dev-api     Run api only"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean       Stop containers and remove volumes"

db-start:
	docker compose up -d postgres
	@echo "PostgreSQL started on localhost:5432"

db-stop:
	docker compose stop postgres

db-restart:
	docker compose restart postgres

db-logs:
	docker compose logs -f postgres

db-shell:
	docker compose exec postgres psql -U dona -d dona

migrate:
	pnpm --filter api migrate

install:
	pnpm install

dev:
	pnpm dev

dev-web:
	pnpm --filter web dev

dev-api:
	pnpm --filter api dev

clean:
	docker compose down -v
	@echo "Containers stopped and volumes removed"
