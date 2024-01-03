SHELL:=$(PREFIX)/bin/sh

build: \
	packages/ts/schema-intermediate \
	packages/ts/schema-draft-04 \
	packages/ts/schema-draft-2020-12 \

	npm install

out/schema-intermediate: packages/oas/schema-intermediate/src/schema.yaml
	packages/ts/jns42-generator/bin/jns42-generator package file://${PWD}/$< \
		--package-directory $@ \
		--package-name $(notdir $(basename $@)) \

out/schema-draft-04:
	packages/ts/jns42-generator/bin/jns42-generator package http://json-schema.org/draft-04/schema\# \
		--package-directory $@ \
		--package-name $(notdir $(basename $@)) \

out/schema-draft-2020-12:
	packages/ts/jns42-generator/bin/jns42-generator package https://json-schema.org/draft/2020-12/schema \
		--package-directory $@ \
		--package-name $(notdir $(basename $@)) \

packages/ts/%: out/%
	rm -rf $@
	mv $< $@

	npm install --workspace $(notdir $(basename $@))
	npm run build --workspace $(notdir $(basename $@))

.PHONY: \
	build \
	rebuild \
	clean \
