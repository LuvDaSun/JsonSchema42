SHELL:=$(PREFIX)/bin/sh
NPM_VERSION:=$(shell npx jns42-generator --version)

build: \
	generated/npm/schema-intermediate \
	generated/npm/schema-draft-04 \
	generated/npm/schema-draft-2020-12 \
	generated/npm/schema-oas-v3-1 \
	generated/npm/swagger-v2 \
	generated/npm/oas-v3-0 \
	generated/npm/oas-v3-1 \

rebuild: \
	clean build

clean: \

	rm --recursive --force generated/npm/schema-intermediate
	rm --recursive --force generated/npm/schema-draft-04
	rm --recursive --force generated/npm/schema-draft-2020-12
	rm --recursive --force generated/npm/schema-oas-v3-1 \
	rm --recursive --force generated/npm/swagger-v2 \
	rm --recursive --force generated/npm/oas-v3-0 \
	rm --recursive --force generated/npm/oas-v3-1 \

generated/npm/schema-intermediate: packages/oas/schema-intermediate/src/schema.yaml
	mkdir --parents $(@D)

	npx jns42-generator package file://${PWD}/$< \
		--package-directory $@ \
		--package-name @jns42/$(notdir $(basename $@)) \
		--package-version ${NPM_VERSION} \

	npm install --workspace $@

generated/npm/schema-draft-04:
	mkdir --parents $(@D)

	npx jns42-generator package http://json-schema.org/draft-04/schema\# \
		--package-directory $@ \
		--package-name @jns42/$(notdir $(basename $@)) \
		--package-version ${NPM_VERSION} \

	npm install --workspace $@

generated/npm/schema-draft-2020-12:
	mkdir --parents $(@D)

	npx jns42-generator package https://json-schema.org/draft/2020-12/schema \
		--package-directory $@ \
		--package-name @jns42/$(notdir $(basename $@)) \
		--package-version ${NPM_VERSION} \

	npm install --workspace $@

generated/npm/schema-oas-v3-1:
	mkdir --parents $(@D)

	npx jns42-generator package https://spec.openapis.org/oas/3.1/dialect/base \
		--package-directory $@ \
		--package-name @jns42/$(notdir $(basename $@)) \
		--package-version ${NPM_VERSION} \

	npm install --workspace $@

generated/npm/swagger-v2:
	mkdir --parents $(@D)

	npx jns42-generator package http://swagger.io/v2/schema.json\# \
		--package-directory $@ \
		--package-name @jns42/$(notdir $(basename $@)) \
		--package-version ${NPM_VERSION} \

	npm install --workspace $@

generated/npm/oas-v3-0:
	mkdir --parents $(@D)

	npx jns42-generator package https://spec.openapis.org/oas/3.0/schema/2021-09-28 \
		--package-directory $@ \
		--package-name @jns42/$(notdir $(basename $@)) \
		--package-version ${NPM_VERSION} \

	npm install --workspace $@

generated/npm/oas-v3-1:
	mkdir --parents $(@D)

	npx jns42-generator package https://spec.openapis.org/oas/3.1/schema/2022-10-07 \
		--package-directory $@ \
		--package-name @jns42/$(notdir $(basename $@)) \
		--package-version ${NPM_VERSION} \

	npm install --workspace $@

.PHONY: \
	build \
	rebuild \
	clean \
