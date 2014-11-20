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
	$(BUILD).base.js $(BUILD).base.min.js \
	$(BUILD).nolodash.js $(BUILD).nolodash.min.js \
	$(BUILD).nolodash.base.js $(BUILD).nolodash.base.min.js

$(BUILD).js: lib/*.js | build
	`npm bin`/browserify $(PROJECT).js > $@

$(BUILD).nolodash.js: lib/*.js | build
	`npm bin`/browserify $(PROJECT).nolodash.js > $@

$(BUILD).base.js: lib/*.js | build
	`npm bin`/browserify $(PROJECT).base.js > $@

$(BUILD).nolodash.base.js: lib/*.js | build
	`npm bin`/browserify $(PROJECT).nolodash.base.js > $@

build: 
	mkdir -p build
