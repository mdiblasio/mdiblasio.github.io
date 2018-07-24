const partialsStrategy = workbox.strategies.staleWhileRevalidate({
  cacheName: "partials"
});

const streamsStrategy = workbox.streams.strategy([
  ({ event }) => partialsStrategy.makeRequest({ event, request: "header.partial.html" }),
  ({ event }) => partialsStrategy.makeRequest({ event, request: "body.partial.html" }),
  ({ event }) => partialsStrategy.makeRequest({ event, request: "footer.partial.html" }),
], { 'content-type': 'text/html' });


const streamsStrategy = workbox.streams.strategy([
  () => fetch("header.partial.html"),
  () => fetch("body.partial.html"),
  () => fetch("footer.partial.html"),
], { 'content-type': 'text/html' });

workbox.routing.registerRoute(
  /index\.html/,
  streamsStrategy
);
