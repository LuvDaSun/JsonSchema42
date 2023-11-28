SHELL:=$(PREFIX)/bin/sh

build: \
	../ts/jns42-schema-intermediate \
	../ts/jns42-schema-draft-04 \
	../ts/jns42-schema-draft-2020-12 \

	npm install

out/jns42-schema-intermediate: jns42-schema-intermediate/src/schema.yaml
	../ts/jns42-generator/out/program.js package file://${PWD}/$< \
		--package-directory $@ \
		--package-name $(notdir $(basename $@)) \
		--package-version 0.0.0 \

out/jns42-schema-draft-04:
	../ts/jns42-generator/out/program.js package http://json-schema.org/draft-04/schema\# \
		--package-directory $@ \
		--package-name $(notdir $(basename $@)) \
		--package-version 0.0.0 \

out/jns42-schema-draft-2020-12:
	../ts/jns42-generator/out/program.js package https://json-schema.org/draft/2020-12/schema \
		--package-directory $@ \
		--package-name $(notdir $(basename $@)) \
		--package-version 0.0.0 \

../ts/%: out/%
	rm -rf $@
	mv $< $@

	npm install --workspace $(notdir $(basename $@))
	npm run build --workspace $(notdir $(basename $@))

.PHONY: \
	build \
	rebuild \
	clean \
