PROJECT:=underarm

BUILD ?= build/$(PROJECT)

.PHONY: all clean js test serve
all: test js

clean:
	rm -rf build

test: | node_modules
	`npm bin`/tape test/*.js

node_modules:
	npm install

%.min.js: %.js | node_modules
	`npm bin`/uglifyjs $< > $@ -c -m

js: $(BUILD).js $(BUILD).min.js \
	$(BUILD).base.js $(BUILD).base.min.js

$(BUILD).js: lib/*.js | build
	`npm bin`/browserify -p bundle-collapser/plugin $(PROJECT).js > $@

$(BUILD).base.js: lib/*.js | build
	`npm bin`/browserify -p bundle-collapser/plugin $(PROJECT).base.js > $@

build: 
	mkdir -p build
