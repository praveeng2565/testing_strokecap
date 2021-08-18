'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "b9f4f63d3d0525e1d3f239d8157185df",
"assets/assets/africa.json": "12417da15bcdb19e7b6d317397be398c",
"assets/assets/australia.json": "581d9a831f3376bcedbb019e5975f2fe",
"assets/assets/bhutan.json": "ecdacd71ea3b6b5eb00ef22c4165b398",
"assets/assets/brazil.json": "60d58b946c3e19f94570bee88aedfb22",
"assets/assets/california.json": "09291e63b2fbe5dbc316d4d2c52d23af",
"assets/assets/france.json": "23b5fb1f421fe1bd04eb513ff6c94a23",
"assets/assets/iceland.json": "48698b68ef475e645e06cbee31333a8c",
"assets/assets/india.json": "4465c7d29f99cfdfc32919aaead1be4c",
"assets/assets/Ireland.json": "24dc14359934ca562e3874152477da74",
"assets/assets/south_america.json": "73bdf48ce9f7487b0e1dda5968cc7190",
"assets/assets/SriLanka.json": "c6703584ed3bcd29adafd0e42b085d71",
"assets/assets/sudan.json": "46e0bb0167d7273e7b1df9117ad4fc3a",
"assets/assets/texas.json": "383ae58a9a858f017633eb6823a7eb29",
"assets/assets/Thailand.json": "351255ad7e1fff370b8a72a8fa7a9dbb",
"assets/assets/uk.json": "94431ddef9bb3e08b20fdf4ba422fe6f",
"assets/assets/usa.json": "3d30813e8db499cc478c2798a62a4b9f",
"assets/assets/usa_worldmap.json": "ac8df051585c290df152778e48767023",
"assets/assets/world_map.json": "d14cbad7399713f11b6181a6b6f9afbf",
"assets/assets/world_map_with_antarctica.json": "438c620ea105375fd7df6457a282ac43",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "4e6447691c9509f7acdbf8a931a85ca1",
"assets/images/maps_facebook.png": "f220eaf64e59611e5255093f34cba743",
"assets/images/maps_grid.png": "8a1f3c842119e4aee648e0c47ecc2516",
"assets/images/maps_instagram.png": "3a88d4b0664c71f64d1dfcefe3e93905",
"assets/images/maps_snapchat.png": "79b650cd32c68c4fa8aa6d262adaea76",
"assets/images/maps_tiktok.png": "e47f4b2661b1365522ca957b03b22fd4",
"assets/images/maps_twitter.png": "84202db5b290ba209ee8f9cf5b15b42e",
"assets/images/sync_doodle.png": "475dbaf8f1a45946839e69d658c3b21a",
"assets/images/Taj_Mahal.jpg": "c1b9a76589b9b211ea8df2a335bcc4b4",
"assets/NOTICES": "c46f436bfdccc82914800faee666fb86",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"index.html": "754dcf819070f7c42bbb5a22231633a5",
"/": "754dcf819070f7c42bbb5a22231633a5",
"main.dart.js": "0a2c40b962658b0ac7c2c6a706388c3e",
"manifest.json": "c3c650b6225233ae8dada8ac707bdbb8",
"version.json": "b459f26aaff05ae07aefb47ab288d776"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
