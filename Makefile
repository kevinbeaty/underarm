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
	$(BUILD).base.js $(BUILD).base.min.js \
	$(BUILD).nolodash.js $(BUILD).nolodash.min.js \
	$(BUILD).nolodash.base.js $(BUILD).nolodash.base.min.js

$(BUILD).js: $(PROJECT).js | build
	`npm bin`/browserify $< > $@

$(BUILD).nolodash.js: $(PROJECT).js | build
	`npm bin`/browserify -i ./lib/lodash.js $< > $@

$(BUILD).base.js: $(PROJECT).js | build
	`npm bin`/browserify \
		-i './lib/array.js' -i './lib/unique.js' -i './lib/math.js' \
		-i './lib/push.js' -i './lib/string.js' -i './lib/iterator.js' $< > $@

$(BUILD).nolodash.base.js: $(PROJECT).js | build
	`npm bin`/browserify -i ./lib/lodash.js \
		-i './lib/array.js' -i './lib/unique.js' -i './lib/math.js' \
		-i './lib/push.js' -i './lib/string.js' -i './lib/iterator.js' $< > $@

build:
	mkdir -p build
