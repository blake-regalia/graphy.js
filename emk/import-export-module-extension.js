const R_EXTENSIONLESS = /(from ['"]\.\.?\/[^'"]+?)(?<!\.[cm]?js)(['"])/g;

(async() => {
	let s_contents = '';
	for await(const s_chunk of process.stdin) {
		s_contents += s_chunk;
	}

	const s_replace = s_contents.replace(R_EXTENSIONLESS, '$1.mjs$2');

	process.stdout.end(s_replace);
})();
