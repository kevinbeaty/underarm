PROJECT:=underscore-transducer

BUILD ?= build/$(PROJECT)

.PHONY: all clean js test test-bail
all: test js

clean:
	rm -rf build

test: | node_modules
	`npm bin`/tape test/*.js

test-bail: | node_modules
	$(MAKE) test | `npm bin`/tap-bail

node_modules:
	npm install

%.min.js: %.js | node_modules
	`npm bin`/uglifyjs $< -o $@ -c -m

%.gz: %
	gzip -c9 $^ > $@

js: $(BUILD).js $(BUILD).min.js \
	$(BUILD).base.js $(BUILD).base.min.js

$(BUILD).js: lib/*.js | build
	`npm bin`/browserify -p bundle-collapser/plugin $(PROJECT).js > $@

$(BUILD).base.js: lib/*.js | build
	`npm bin`/browserify $(PROJECT).base.js > $@

build:
	mkdir -p build
