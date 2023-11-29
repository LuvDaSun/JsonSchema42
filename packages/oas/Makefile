SHELL:=$(PREFIX)/bin/sh

build: \
	../ts/schema-intermediate \
	../ts/schema-draft-04 \
	../ts/schema-draft-2020-12 \

	npm install

out/schema-intermediate: schema-intermediate/src/schema.yaml
	../ts/jns42-generator/bin/jns42-generator package file://${PWD}/$< \
		--package-directory $@ \
		--package-name $(notdir $(basename $@)) \
		--package-version 0.0.0 \

out/schema-draft-04:
	../ts/jns42-generator/bin/jns42-generator package http://json-schema.org/draft-04/schema\# \
		--package-directory $@ \
		--package-name $(notdir $(basename $@)) \
		--package-version 0.0.0 \

out/schema-draft-2020-12:
	../ts/jns42-generator/bin/jns42-generator package https://json-schema.org/draft/2020-12/schema \
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
