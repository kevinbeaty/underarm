PROJECT:=underarm
VERSION:=0.1.0

JS_TARGET ?= build/$(PROJECT).js

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

js: $(JS_TARGET) $(JS_TARGET:.js=.min.js)

$(JS_TARGET): $(PROJECT).js lib/*.js | build
	`npm bin`/browserify -i underscore $< > $@

build: 
	mkdir -p build
