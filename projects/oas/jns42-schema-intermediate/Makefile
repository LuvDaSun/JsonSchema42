ifndef PACKAGE_NAME
override PACKAGE_NAME:=$(notdir $(basename $(PWD)))
endif

ifndef PACKAGE_VERSION
override PACKAGE_VERSION:=0.0.0
endif

SHELL:=$(PREFIX)/bin/sh

build: \
	../../ts/jns42-schema-intermediate \

out: src/schema.yaml
	../../ts/jns42-generator/out/program.js package file://${PWD}/$< \
		--package-directory $@ \
		--package-name $(PACKAGE_NAME) \
		--package-version $(PACKAGE_VERSION) \

../../ts/jns42-schema-intermediate: out
	rm -rf ../../ts/jns42-schema-intermediate
	mv $< ../../ts/jns42-schema-intermediate


.PHONY: \
	build \
	rebuild \
	clean \
