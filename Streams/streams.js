var decoder = new TextDecoder();
var stream = new ReadableStream({
    start(controller) {
        // var fetch1 = fetch("file1.txt");
        // var fetch2 = fetch("file2.txt");
        // var fetch3 = fetch("file3.txt");

        function pushStream(_stream) {
            // Get a lock on the stream
            var reader = _stream.getReader();

            return reader.read().then(function process(result) {
                if (result.done) return;
                // Push the value to the combined stream
                controller.enqueue(decoder.decode(result.value, { stream: true }));
                // Read more & process
                return reader.read().then(process);
            });
        }

        fetch("file1.txt")
            .then(res => pushStream(res.body))
            .then(() => fetch("file2.txt"))
            .then(res => pushStream(res.body))
            .then(() => fetch("file3.txt"))
            .then(res => pushStream(res.body))
            .then(() => controller.close());

        // fetch1
        //     .then(res => pushStream(res.body))
        //     .then(() => fetch2)
        //     .then(res => pushStream(res.body))
        //     .then(() => fetch3)
        //     .then(res => pushStream(res.body))
        //     .then(() => controller.close());
    }
});

var myreader = stream.getReader();
myreader.read().then(function processResult(result) {

    if (result.done) {
        console.log("Fetch complete");
        return;
    }
    console.log(result.value);

    return myreader.read().then(processResult);
});


// In the service worker:
self.addEventListener('fetch', event => {

    var decoder = new TextDecoder();
    var stream = new ReadableStream({
        start(controller) {
            // var fetch1 = fetch("file1.txt");
            // var fetch2 = fetch("file2.txt");
            // var fetch3 = fetch("file3.txt");

            function pushStream(_stream) {
                // Get a lock on the stream
                var reader = _stream.getReader();

                return reader.read().then(function process(result) {
                    if (result.done) return;
                    // Push the value to the combined stream
                    controller.enqueue(decoder.decode(result.value, { stream: true }));
                    // Read more & process
                    return reader.read().then(process);
                });
            }

            fetch("file1.txt")
                .then(res => pushStream(res.body))
                .then(() => fetch("file2.txt"))
                .then(res => pushStream(res.body))
                .then(() => fetch("file3.txt"))
                .then(res => pushStream(res.body))
                .then(() => controller.close());

            // fetch1
            //     .then(res => pushStream(res.body))
            //     .then(() => fetch2)
            //     .then(res => pushStream(res.body))
            //     .then(() => fetch3)
            //     .then(res => pushStream(res.body))
            //     .then(() => controller.close());
        }
    });


    event.respondWith(new Response(stream, {
        headers: { 'Content-Type': 'text/html' }
    }));


});