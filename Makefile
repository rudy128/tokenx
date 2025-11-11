# ======================================
# Ambassador TokenX - Docker Makefile
# ======================================

.PHONY: help build build-client build-admin up down restart logs clean

# Default target
help:
	@echo "Ambassador TokenX - Docker Commands"
	@echo ""
	@echo "Build Commands:"
	@echo "  make build          - Build both client and admin images"
	@echo "  make build-client   - Build only client image"
	@echo "  make build-admin    - Build only admin image"
	@echo "  make build-fresh    - Build with no cache"
	@echo ""
	@echo "Run Commands:"
	@echo "  make up             - Start all services"
	@echo "  make down           - Stop all services"
	@echo "  make restart        - Restart all services"
	@echo "  make restart-client - Restart client only"
	@echo "  make restart-admin  - Restart admin only"
	@echo ""
	@echo "Logs Commands:"
	@echo "  make logs           - View logs (all services)"
	@echo "  make logs-client    - View client logs"
	@echo "  make logs-admin     - View admin logs"
	@echo ""
	@echo "Status Commands:"
	@echo "  make ps             - Show running containers"
	@echo "  make health         - Check health endpoints"
	@echo ""
	@echo "Maintenance Commands:"
	@echo "  make clean          - Remove containers and images"
	@echo "  make prune          - Clean up Docker system"
	@echo "  make shell-client   - Access client container shell"
	@echo "  make shell-admin    - Access admin container shell"

# ======================================
# Build Commands
# ======================================

build:
	@echo "🏗️  Building both applications..."
	docker-compose build --parallel

build-client:
	@echo "🏗️  Building client application..."
	docker-compose build client

build-admin:
	@echo "🏗️  Building admin application..."
	docker-compose build admin

build-fresh:
	@echo "🏗️  Building with no cache..."
	docker-compose build --no-cache --parallel

# ======================================
# Run Commands
# ======================================

up:
	@echo "🚀 Starting all services..."
	docker-compose up -d
	@echo "✅ Services started!"
	@echo "   Client: http://localhost:3000"
	@echo "   Admin:  http://localhost:3001"

down:
	@echo "🛑 Stopping all services..."
	docker-compose down
	@echo "✅ Services stopped!"

restart:
	@echo "🔄 Restarting all services..."
	docker-compose restart
	@echo "✅ Services restarted!"

restart-client:
	@echo "🔄 Restarting client..."
	docker-compose restart client

restart-admin:
	@echo "🔄 Restarting admin..."
	docker-compose restart admin

# ======================================
# Logs Commands
# ======================================

logs:
	@echo "📋 Viewing all logs (Ctrl+C to exit)..."
	docker-compose logs -f --tail=100

logs-client:
	@echo "📋 Viewing client logs (Ctrl+C to exit)..."
	docker-compose logs -f --tail=100 client

logs-admin:
	@echo "📋 Viewing admin logs (Ctrl+C to exit)..."
	docker-compose logs -f --tail=100 admin

# ======================================
# Status Commands
# ======================================

ps:
	@echo "📊 Container status:"
	docker-compose ps

health:
	@echo "🏥 Checking health endpoints..."
	@echo ""
	@echo "Client Health:"
	@curl -s http://localhost:3000/api/health | jq . || echo "❌ Client not responding"
	@echo ""
	@echo "Admin Health:"
	@curl -s http://localhost:3001/api/health | jq . || echo "❌ Admin not responding"

stats:
	@echo "📈 Resource usage:"
	docker stats --no-stream ambassador-tokenx-client ambassador-tokenx-admin

# ======================================
# Maintenance Commands
# ======================================

clean:
	@echo "🧹 Cleaning up containers and images..."
	docker-compose down -v --rmi local
	@echo "✅ Cleanup complete!"

prune:
	@echo "🧹 Pruning Docker system..."
	docker system prune -af
	@echo "✅ System pruned!"

shell-client:
	@echo "🐚 Accessing client container shell..."
	docker-compose exec client sh

shell-admin:
	@echo "🐚 Accessing admin container shell..."
	docker-compose exec admin sh

# ======================================
# Development Commands
# ======================================

dev-build:
	@echo "🔧 Building for development..."
	docker-compose -f docker-compose.yml build

dev-up:
	@echo "🔧 Starting development environment..."
	docker-compose up

# ======================================
# Database Commands
# ======================================

db-migrate:
	@echo "🗄️  Running database migrations..."
	docker-compose exec client npx prisma migrate deploy

db-seed:
	@echo "🌱 Seeding database..."
	docker-compose exec client npx prisma db seed

db-studio:
	@echo "🎨 Opening Prisma Studio..."
	docker-compose exec client npx prisma studio

# ======================================
# Deployment Commands
# ======================================

deploy: build-fresh
	@echo "🚀 Deploying to production..."
	docker-compose up -d
	@echo "✅ Deployment complete!"

deploy-client: build-client
	@echo "🚀 Deploying client..."
	docker-compose up -d client
	@echo "✅ Client deployed!"

deploy-admin: build-admin
	@echo "🚀 Deploying admin..."
	docker-compose up -d admin
	@echo "✅ Admin deployed!"

# ======================================
# Testing Commands
# ======================================

test:
	@echo "🧪 Running tests..."
	docker-compose exec client pnpm test

lint:
	@echo "🔍 Running linter..."
	docker-compose exec client pnpm lint

# ======================================
# Backup Commands
# ======================================

backup:
	@echo "💾 Creating backup..."
	@mkdir -p backups
	docker-compose exec -T client npx prisma db pull > backups/schema-backup-$(shell date +%Y%m%d-%H%M%S).prisma
	@echo "✅ Backup created in backups/"

# ======================================
# Install Commands
# ======================================

install:
	@echo "📦 Installing dependencies..."
	pnpm install

# ======================================
# Complete workflow
# ======================================

all: build up health
	@echo "🎉 All done! Services are running."
