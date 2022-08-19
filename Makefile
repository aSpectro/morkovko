install:
	yarn

dev: install
	yarn start:dev

build: install
	yarn build

prod: build
	yarn start:prod

db:
	yarn start:dev:db