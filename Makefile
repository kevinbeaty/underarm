PROJECT:=underarm
VERSION:=0.0.2

JS_TARGET ?= build/$(PROJECT)-$(VERSION).js

.PHONY: all clean js test serve
all: test js

clean:
	rm -rf build

test: | node_modules
	npm test

node_modules:
	npm install

%.min.js: %.js | node_modules
	`npm bin`/uglifyjs $< > $@

%.gz: %
	gzip -c9 $^ > $@

js: $(JS_TARGET) $(JS_TARGET:.js=.min.js) $(JS_TARGET:.js=.min.js.gz)

$(JS_TARGET): index.js lib/*.js | build
	`npm bin`/browserify $< > $@

build: 
	mkdir -p build
