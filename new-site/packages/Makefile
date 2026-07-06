PROJECT=semcomp

up:
	docker compose -p $(PROJECT) --env-file ./backend/.env  up -d

build:
	docker compose -p $(PROJECT) --env-file ./backend/.env  up -d --build

down:
	docker compose -p $(PROJECT) down

restart:
	docker compose -p $(PROJECT) down
	docker compose -p $(PROJECT) --env-file ./backend/.env  up -d --build

reset:
	docker compose -p $(PROJECT) --env-file ./backend/.env down -v 

logs:
	docker compose -p $(PROJECT) logs -f

logs-front:
	docker compose -p $(PROJECT) logs -f front-site

bash-front:
	docker compose -p $(PROJECT) exec front-site sh

logs-backoffice:
	docker compose -p $(PROJECT) logs -f backoffice

bash-backoffice:
	docker compose -p $(PROJECT) exec backoffice sh

logs-backend:
	docker compose -p $(PROJECT) logs -f backend

bash-backend:
	docker compose -p $(PROJECT) exec backend sh

psql:
	docker compose -p $(PROJECT) exec db psql -U semcomp -d SemcompDB

logs-db:
	docker compose -p $(PROJECT) logs -f db
	
ps:
	docker compose -p $(PROJECT) ps
