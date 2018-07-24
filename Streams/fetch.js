var decoder = new TextDecoder();
fetch("file1.txt")
	.then(response => response.body)
	.then(stream => stream.getReader().read())
	.then(result => console.log(decoder.decode(result.value, {stream: true})));