ifndef PACKAGE_NAME
override PACKAGE_NAME:=$(notdir $(basename $(PWD)))
endif

ifndef TAG
override TAG:=v0.0.0
endif

SHELL:=$(PREFIX)/bin/sh
PACKAGE_VERSION:=$(shell npx semver $(TAG))

rebuild: clean build

build: \
	out/static/version.txt \
	out/static/schema.json \
	out/static/schema.yaml \
	out/schema \

clean:
	rm -rf out

out/static/version.txt:
	@mkdir --parents $(@D)
	echo $(VERSION) > $@

out/static/%: src/%
	@mkdir --parents $(@D)
	cp $< $@

out/static/%.json: out/static/%.yaml
	@mkdir --parents $(@D)
	npx yaml2json --pretty $< > $@

out/%: out/static/%.json
	npx jns42-generator package file://${PWD}/$< \
		--package-directory $@ \
		--package-name $(PACKAGE_NAME) \
		--package-version $(PACKAGE_VERSION) \


	( cd $@ ; npm install --unsafe-perm )


.PHONY: \
	build \
	rebuild \
	clean \
