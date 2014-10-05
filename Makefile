PROJECT:=underscore-transducer
VERSION:=0.0.4

JS_TARGET ?= build/$(PROJECT)-$(VERSION).js

.PHONY: all clean js test serve
all: test js

clean:
	rm -rf build

test: | node_modules
	`npm bin`/tape test/*.js

node_modules:
	npm install

%.min.js: %.js | node_modules
	`npm bin`/uglifyjs $< -o $@ -c -m

%.gz: %
	gzip -c9 $^ > $@

js: $(JS_TARGET) $(JS_TARGET:.js=.min.js) $(JS_TARGET:.js=.min.js.gz)

$(JS_TARGET): underscore-transducer.js | build
	cp $< $@

build: 
	mkdir -p build
