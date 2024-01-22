SHELL:=$(PREFIX)/bin/sh

build: \
	packages/ts/schema-intermediate \
	packages/ts/schema-draft-04 \
	packages/ts/schema-draft-2020-12 \

	npm install

rebuild: \
	clean build

clean: \

	rm --recursive --force packages/ts/schema-intermediate
	rm --recursive --force packages/ts/schema-draft-04
	rm --recursive --force packages/ts/schema-draft-2020-12

out/schema-intermediate: packages/oas/schema-intermediate/src/schema.yaml
	mkdir --parents $(@D)

	npx jns42-generator package file://${PWD}/$< \
		--package-directory $@ \
		--package-name $(notdir $(basename $@)) \
		--package-version 0.0.0 \

out/schema-draft-04:
	mkdir --parents $(@D)

	npx jns42-generator package http://json-schema.org/draft-04/schema\# \
		--package-directory $@ \
		--package-name $(notdir $(basename $@)) \
		--package-version 0.0.0 \

out/schema-draft-2020-12:
	mkdir --parents $(@D)

	npx jns42-generator package https://json-schema.org/draft/2020-12/schema \
		--package-directory $@ \
		--package-name $(notdir $(basename $@)) \
		--package-version 0.0.0 \

packages/ts/%: out/%
	mkdir --parents $(@D)
	
	rm -rf $@
	mv $< $@

	npm install --workspace $@
	npm run clean --workspace $@
	npm run build --workspace $@

.PHONY: \
	build \
	rebuild \
	clean \
