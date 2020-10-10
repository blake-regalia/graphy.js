(async() => {
	let s_contents = '';
	for await(const s_chunk of process.stdin) {
		s_contents += s_chunk;
	}

	const s_replace = s_contents.replace(/((?:^|\n))[ \t]*(\/\/ [^\n]+)\n([ \t]*)/g,
		(s_line, s_pre, s_comment, s_indent) => `${s_pre}${s_indent}${s_comment}\n${s_indent}`);

	process.stdout.end(s_replace);
})();
