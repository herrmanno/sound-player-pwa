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

self.addEventListener("install", function(e) {
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            return cache.addAll([...otherRessources, ...sounds].map(url => {
                return new Request(url, { cache: "reload" })
            }))
        })
    )
    // The promise that skipWaiting() returns can be safely ignored.
    self.skipWaiting()
})

self.addEventListener("activate", function (_e) {
    self.clients.claim()
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
            // try fetch-first if online and html file is requested
            // otherwise index.html could never be updated w/o a serviceworker update
            (self.navigator.onLine && event.request.mode === "navigate"
                ? fetch(event.request)
                : Promise.reject("offline")
            )
            .catch(() => {
                return caches.open(cacheName)
                .then(cache => {
                    return cache.match(event.request, {
                        ignoreMethod: true,
                        ignoreSearch: true,
                        ignoreVary: true,
                    })
                })
                .then(response => {
                    // if we're online an requested images or sound, try to fetch them
                    // as fallback, if they're not cached.
                    // thats okay, because sound only gets updated on a serviceworker update
                    if (self.navigator.onLine && event.request.mode !== "navigate") {
                        return response || fetch(event.request)
                    } else {
                        return response
                    }
                })
            })
        )
    }
})
