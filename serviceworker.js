const cacheName = "v1"
const sounds = [
    "gong",
    "sword",
    "glass"
].map(s => `./sounds/${s}.mp3`)

const otherRessources = [
    "./",
    "./index.html",
    "./favicon.ico",
]

self.addEventListener("install", function(_e) {
    // The promise that skipWaiting() returns can be safely ignored.
    self.skipWaiting()
})

self.addEventListener("activate", function (e) {
    self.clients.claim()
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            return cache.addAll([...otherRessources, ...sounds])
        })
    )
})

self.addEventListener("fetch", function (event) {
    if ((/cache\/keys/).test(event.request.url)) {
        event.respondWith(
            caches.open(cacheName)
            .then(c => c.keys())
            .then(ks => {
                return new Response(JSON.stringify(ks.map(r => r.url)), {status: 200})
            })
        )
    } else {
        event.respondWith(
            caches.match(event.request, {
                ignoreMethod: true,
                ignoreSearch: true,
                ignoreVary: true,
            }).then(function (response) {
                return response || fetch(event.request)
            })
        )
    }
})