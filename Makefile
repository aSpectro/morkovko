install:
	yarn

commit:
	npm version patch --no-git-tag-version && \
	git add . && \
	git commit -am "some updates" && \
	git push origin main

dev: install
	yarn start:dev

mutator: install
	yarn start:mutator

redis:
	yarn redis

build: install
	yarn build

prod: build
	yarn start:prod

db:
	yarn db