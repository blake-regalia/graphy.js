#!/bin/bash
echo "./build/ts/$(dirname $1)"
npx tsc -d --outDir "./build/ts/$(dirname $1)" --module commonjs \
	-t es2019 --lib es2019,es2020.promise,es2020.bigint,es2020.string \
	--strict --esModuleInterop --skipLibCheck --forceConsistentCasingInFileNames \
	./src/$1 && npx eslint --fix --color --rule 'no-debugger: off' ./build/ts/$1.js
