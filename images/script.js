

function block(ms) {
	let start = performance.now();
	let now = start;
	while (now - start < ms) {
		now = performance.now();
	}
}

block(1000);