PROJECT:=underarm
BUILD:=build/$(PROJECT)
NPM_BIN:=$(shell npm bin)

.PHONY: all clean js test test-bail
all: test js

clean:
	rm -rf build

test: | node_modules
	$(NPM_BIN)/tape test/*.js

test-bail: | node_modules
	$(MAKE) test | $(NPM_BIN)/tap-bail

node_modules:
	npm install

%.min.js: %.js | node_modules
	$(NPM_BIN)/uglifyjs $< -o $@ -c -m

%.gz: %
	gzip -c9 $^ > $@

js: $(BUILD).js $(BUILD).min.js \
	$(BUILD).base.js $(BUILD).base.min.js

$(BUILD).js: lib/*.js | build
	$(NPM_BIN)/browserify -p bundle-collapser/plugin $(PROJECT).js > $@

$(BUILD).base.js: lib/*.js | build
	$(NPM_BIN)/browserify -p bundle-collapser/plugin $(PROJECT).base.js > $@

build:
	mkdir -p build
