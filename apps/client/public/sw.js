const CACHE_NAME = "ambassador-platform-v1"
const STATIC_CACHE = "static-v1"
const DYNAMIC_CACHE = "dynamic-v1"

// Assets to cache on install
const STATIC_ASSETS = ["/", "/dashboard", "/auth/signin", "/manifest.json", "/icon-192x192.png", "/icon-512x512.png"]

// API routes that should be cached
const API_CACHE_PATTERNS = [/^\/api\/campaigns/, /^\/api\/tasks/, /^\/api\/user\/profile/]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("Caching static assets")
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        return self.skipWaiting()
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE
            })
            .map((cacheName) => {
              console.log("Deleting old cache:", cacheName)
              return caches.delete(cacheName)
            }),
        )
      })
      .then(() => {
        return self.clients.claim()
      }),
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle API requests
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Handle navigation requests
  if (request.mode === "navigate") {
    event.respondWith(handleNavigationRequest(request))
    return
  }

  // Handle static assets
  event.respondWith(handleStaticRequest(request))
})

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url)
  const shouldCache = API_CACHE_PATTERNS.some((pattern) => pattern.test(url.pathname))

  if (!shouldCache) {
    return fetch(request)
  }

  try {
    // Try network first
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Return offline response for API calls
    return new Response(
      JSON.stringify({
        error: "Offline",
        message: "This feature requires an internet connection",
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

// Handle navigation requests with cache-first strategy for shell
async function handleNavigationRequest(request) {
  try {
    // Try network first for navigation
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    // Fallback to cached version or app shell
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Return app shell for offline navigation
    return caches.match("/")
  }
}

// Handle static requests with cache-first strategy
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request)

  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    // Return fallback for images
    if (request.destination === "image") {
      return caches.match("/icon-192x192.png")
    }

    throw error
  }
}

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(handleBackgroundSync())
  }
})

async function handleBackgroundSync() {
  // Handle queued offline actions
  console.log("Performing background sync")

  // This would typically:
  // 1. Send queued task submissions
  // 2. Sync user progress
  // 3. Update cached data
}

// Push notifications
self.addEventListener("push", (event) => {
  if (!event.data) return

  const data = event.data.json()
  const options = {
    body: data.body,
    icon: "/icon-192x192.png",
    badge: "/icon-72x72.png",
    data: data.data,
    actions: [
      {
        action: "view",
        title: "View",
        icon: "/icon-72x72.png",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "view") {
    const url = event.notification.data?.url || "/dashboard"
    event.waitUntil(clients.openWindow(url))
  }
})
