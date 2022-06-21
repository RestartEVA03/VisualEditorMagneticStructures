'use strict';
importScripts('sw-toolbox.js'); 
toolbox.precache(["index.html","css/style.min.css", "js/simulate.js", "js/webglspins.min.js"]); 
toolbox.router.get('/img/*', toolbox.cacheFirst); 
toolbox.router.get('/*', toolbox.networkFirst, { networkTimeoutSeconds: 5});