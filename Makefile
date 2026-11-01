all: node_modules
	npm test
	npm run lint

node_modules: package.json package-lock.json
	npm ci
