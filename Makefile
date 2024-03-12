SHELL:=$(PREFIX)/bin/sh

build: \
	generated/npm \
	# generated/cargo \

generated/npm: \
	generated/npm/schema-intermediate \
	generated/npm/schema-draft-04 \
	generated/npm/schema-draft-2020-12 \
	generated/npm/schema-oas-v3-1 \
	generated/npm/swagger-v2 \
	generated/npm/oas-v3-0 \
	generated/npm/oas-v3-1 \

	npm run build --workspaces

	# Link the generated code, but don't save those links to the package lock
	npm install --no-package-lock

generated/cargo: \
	generated/cargo/schema-intermediate \

rebuild: \
	clean build

clean: \

	rm -rf generated

generated/npm/schema-intermediate: packages/oas/schema-intermediate/src/schema.yaml
	mkdir -p $(@D)

	npx jns42-generator package $< \
		--package-directory $@ \
		--package-name @jns42/$(notdir $(basename $@)) \
		--package-version $(shell npx jns42-generator --version) \

generated/npm/schema-draft-04:
	mkdir -p $(@D)

	npx jns42-generator package http://json-schema.org/draft-04/schema\# \
		--package-directory $@ \
		--package-name @jns42/$(notdir $(basename $@)) \
		--package-version $(shell npx jns42-generator --version) \

generated/npm/schema-draft-2020-12:
	mkdir -p $(@D)

	npx jns42-generator package https://json-schema.org/draft/2020-12/schema \
		--package-directory $@ \
		--package-name @jns42/$(notdir $(basename $@)) \
		--package-version $(shell npx jns42-generator --version) \

generated/npm/schema-oas-v3-1:
	mkdir -p $(@D)

	npx jns42-generator package https://spec.openapis.org/oas/3.1/dialect/base \
		--package-directory $@ \
		--package-name @jns42/$(notdir $(basename $@)) \
		--package-version $(shell npx jns42-generator --version) \

generated/npm/swagger-v2:
	mkdir -p $(@D)

	npx jns42-generator package http://swagger.io/v2/schema.json\# \
		--package-directory $@ \
		--package-name @jns42/$(notdir $(basename $@)) \
		--package-version $(shell npx jns42-generator --version) \

generated/npm/oas-v3-0:
	mkdir -p $(@D)

	npx jns42-generator package https://spec.openapis.org/oas/3.0/schema/2021-09-28 \
		--package-directory $@ \
		--package-name @jns42/$(notdir $(basename $@)) \
		--package-version $(shell npx jns42-generator --version) \

generated/npm/oas-v3-1:
	mkdir -p $(@D)

	npx jns42-generator package https://spec.openapis.org/oas/3.1/schema/2022-10-07 \
		--package-directory $@ \
		--package-name @jns42/$(notdir $(basename $@)) \
		--package-version $(shell npx jns42-generator --version) \

generated/cargo/schema-intermediate: packages/oas/schema-intermediate/src/schema.yaml
	mkdir -p $(@D)

	cargo run \
		--package jns42-generator \
		package $< \
		--package-directory $@ \
		--package-name jns42-$(notdir $(basename $@)) \
		--package-version $(word 2,$(shell cargo run --package jns42-generator -- --version)) \

.PHONY: \
	build \
	rebuild \
	clean \
