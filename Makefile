SHELL:=$(PREFIX)/bin/sh
VERSION:=0.4.0

build: \
	generated/ts/schema-intermediate \
	generated/ts/schema-draft-04 \
	generated/ts/schema-draft-2020-12 \
	generated/ts/schema-oas-v3-1 \
	generated/ts/swagger-v2 \
	generated/ts/oas-v3-0 \
	generated/ts/oas-v3-1 \

	npm install

rebuild: \
	clean build

clean: \

	rm --recursive --force generated/ts/schema-intermediate
	rm --recursive --force generated/ts/schema-draft-04
	rm --recursive --force generated/ts/schema-draft-2020-12
	rm --recursive --force generated/ts/schema-oas-v3-1 \
	rm --recursive --force generated/ts/swagger-v2 \
	rm --recursive --force generated/ts/oas-v3-0 \
	rm --recursive --force generated/ts/oas-v3-1 \

generated/ts/schema-intermediate: packages/oas/schema-intermediate/src/schema.yaml
	mkdir --parents $(@D)

	npx jns42-generator package file://${PWD}/$< \
		--package-directory $@ \
		--package-name @jns42/$(notdir $(basename $@)) \
		--package-version ${VERSION} \

generated/ts/schema-draft-04:
	mkdir --parents $(@D)

	npx jns42-generator package http://json-schema.org/draft-04/schema\# \
		--package-directory $@ \
		--package-name @jns42/$(notdir $(basename $@)) \
		--package-version ${VERSION} \

generated/ts/schema-draft-2020-12:
	mkdir --parents $(@D)

	npx jns42-generator package https://json-schema.org/draft/2020-12/schema \
		--package-directory $@ \
		--package-name @jns42/$(notdir $(basename $@)) \
		--package-version ${VERSION} \

generated/ts/schema-oas-v3-1:
	mkdir --parents $(@D)

	npx jns42-generator package https://spec.openapis.org/oas/3.1/dialect/base \
		--package-directory $@ \
		--package-name @jns42/$(notdir $(basename $@)) \
		--package-version ${VERSION} \


generated/ts/swagger-v2:
	mkdir --parents $(@D)

	npx jns42-generator package http://swagger.io/v2/schema.json\# \
		--package-directory $@ \
		--package-name @jns42/$(notdir $(basename $@)) \
		--package-version ${VERSION} \

generated/ts/oas-v3-0:
	mkdir --parents $(@D)

	npx jns42-generator package https://spec.openapis.org/oas/3.0/schema/2021-09-28 \
		--package-directory $@ \
		--package-name @jns42/$(notdir $(basename $@)) \
		--package-version ${VERSION} \

generated/ts/oas-v3-1:
	mkdir --parents $(@D)

	npx jns42-generator package https://spec.openapis.org/oas/3.1/schema/2022-10-07 \
		--package-directory $@ \
		--package-name @jns42/$(notdir $(basename $@)) \
		--package-version ${VERSION} \

.PHONY: \
	build \
	rebuild \
	clean \
