#!/usr/bin/env node
const fs = require('fs');

let p_build = process.argv[2];

let s_contents = fs.readFileSync(p_build, 'utf8');

let s_replace = s_contents.replace(/((?:^|\n))[ \t]*(\/\/ [^\n]+)\n([ \t]*)/g,
	(s_line, s_pre, s_comment, s_indent) => `${s_pre}${s_indent}${s_comment}\n${s_indent}`);

fs.writeFileSync(p_build, s_replace);
