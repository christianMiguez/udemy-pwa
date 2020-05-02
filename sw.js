// app shell
const CACHE_STATIC_NAME = 'static-v2';

// dynamic content (grows)
const CACHE_DYNAMIC_NAME = 'dynamic-v1.0';

const CACHE_INMUTABLE_NAME = 'inmutable-v1.0';

function cacheCleaner(cacheName, numeroItems) {
    caches.open(cacheName).then(cache => {
        return cache.keys().then( keys => {
            if(keys.length > numeroItems) {
                cache.delete(keys[0]).then(cacheCleaner(cacheName, numeroItems))
            }
        })
    });
}

self.addEventListener('install', e => {

    const cachePromise = caches.open(CACHE_STATIC_NAME).then(cache => {
        return cache.addAll([
            '/',
            '/index.html',
            '/css/style.css',
            'img/main.jpg',
            '/js/app.js',
        ]);
    });

    const cachePromiseInmut = caches.open(CACHE_INMUTABLE_NAME).then(cache => cache.add(
            'https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css'
        )
    );

    //espera hasta que esta promesa se resuelva
    e.waitUntil( Promise.all([cachePromise, cachePromiseInmut]));

});

self.addEventListener('fetch', e => {

    const respuesta = caches.match( e.request ).then( res => {
        if ( res ) return res;

        console.log('No existe', e.request.url)

        return fetch( e.request ).then(newResp => {
            caches.open( CACHE_DYNAMIC_NAME ).then(cache => {
                cache.put(e.request, newResp); 
                cacheCleaner(CACHE_DYNAMIC_NAME, 50)
            })
            return newResp.clone();
        })
    })
    e.respondWith( respuesta )

})