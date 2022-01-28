const cacheName = "v1"
const sounds = [
    "gong",
    "sword",
    "glass"
]

self.addEventListener("install", function (e) {
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            return cache.addAll(["index.html", ...sounds.map(s => `sounds/${s}.mp3`)])
        })
    )
})

self.addEventListener("fetch", function (event) {
    if (event.request.url === "https://cache/keys") {
        event.respondWith(
            caches.open(cacheName)
            .then(c => c.keys())
            .then(ks => {
                return new Response(JSON.stringify(ks.map(r => r.url)), {status: 200})
            })
        )
    } else {
        event.respondWith(
            caches.match(event.request).then(function (response) {
                return response || fetch(event.request)
            })
        )
    }
})