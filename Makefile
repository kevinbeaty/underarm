PROJECT:=$(shell node -e "console.log(require('./package.json').name)")
VERSION:=$(shell node -e "console.log(require('./package.json').version)")
HOMEPAGE:=$(shell node -e "console.log(require('./package.json').homepage)")
LICENSE:=$(shell node -e "console.log(require('./package.json').license)")
NPM_BIN:=$(shell npm bin)

JS_TARGET ?= build/$(PROJECT)-$(VERSION).js
JS_HEADER = /* $(PROJECT) v$(VERSION) | $(HOMEPAGE) | License: $(LICENSE) */

.PHONY: all clean js test serve
all: test js

clean:
	rm -rf build

test: | node_modules
	npm test

serve: | node_modules
	node bin/serve.js

node_modules:
	npm install

%.min.js: %.js | node_modules
	$(NPM_BIN)/uglifyjs $< > $@

%.gz: %
	gzip -c9 $^ > $@

# JavaScript
js: $(JS_TARGET) $(JS_TARGET:.js=.min.js) $(JS_TARGET:.js=.min.js.gz)

$(JS_TARGET): src/$(PROJECT).js  | build
	echo "$(JS_HEADER)" > $@ 
	cat $< >> $@ 

build: 
	mkdir -p build
