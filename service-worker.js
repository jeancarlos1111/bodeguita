if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let i=Promise.resolve();return a[e]||(i=new Promise(async i=>{if("document"in self){const a=document.createElement("script");a.src=e,document.head.appendChild(a),a.onload=i}else importScripts(e),i()})),i.then(()=>{if(!a[e])throw new Error(`Module ${e} didn’t register its module`);return a[e]})},i=(i,a)=>{Promise.all(i.map(e)).then(e=>a(1===e.length?e[0]:e))},a={require:Promise.resolve(i)};self.define=(i,c,o)=>{a[i]||(a[i]=Promise.resolve().then(()=>{let a={};const n={uri:location.origin+i.slice(1)};return Promise.all(c.map(i=>{switch(i){case"exports":return a;case"module":return n;default:return e(i)}})).then(e=>{const i=o(...e);return a.default||(a.default=i),a})}))}}define("./service-worker.js",["./workbox-17d1bea3"],(function(e){"use strict";e.setCacheNameDetails({prefix:"bodeguita"}),e.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/bodeguita/css/app.0e433876.css",revision:"d41d8cd98f00b204e9800998ecf8427e"},{url:"/bodeguita/css/vendor.b1931601.css",revision:"b55f723f87a65d5942307d07385f5694"},{url:"/bodeguita/favicon.ico",revision:"c5a18f9563bf0a95a80561799a230a42"},{url:"/bodeguita/fonts/KFOkCnqEu92Fr1MmgVxIIzQ.9391e6e2.woff",revision:"04b7fd97f88b82dccce5ec446ccc29e6"},{url:"/bodeguita/fonts/KFOlCnqEu92Fr1MmEU9fBBc-.ddd11dab.woff",revision:"da2721c68b4bc80db8d4c404f76b118c"},{url:"/bodeguita/fonts/KFOlCnqEu92Fr1MmSU5fBBc-.877b9231.woff",revision:"bf0f407102faf3a0b521d3b545f547a5"},{url:"/bodeguita/fonts/KFOlCnqEu92Fr1MmWUlfBBc-.0344cc3c.woff",revision:"68d6dabfe54e245e7d5d5c16c3c4b1a9"},{url:"/bodeguita/fonts/KFOlCnqEu92Fr1MmYUtfBBc-.b555d228.woff",revision:"64bba9c4e8156c152050c657e9d24bf1"},{url:"/bodeguita/fonts/KFOmCnqEu92Fr1Mu4mxM.9b78ea3b.woff",revision:"dc3e086fc0c5addc09702e111d2adb42"},{url:"/bodeguita/fonts/flUhRq6tzZclQEJ-Vdg-IuiaDsNa.40fa1be9.woff",revision:"caa770efda54fac54bc3654cc52ac338"},{url:"/bodeguita/fonts/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.cf9862e8.woff2",revision:"9104e18ea5e1a8093416b5a41b43ac56"},{url:"/bodeguita/icons/apple-icon-120x120.png",revision:"1f53d75014898f4de716368116824632"},{url:"/bodeguita/icons/apple-icon-152x152.png",revision:"38bc8d3c5af7d2a7c562bb353938d869"},{url:"/bodeguita/icons/apple-icon-167x167.png",revision:"fb9530c58e7686c37721c954e64bf857"},{url:"/bodeguita/icons/apple-icon-180x180.png",revision:"16dd4ad70c148d28e2800b013ba7bf40"},{url:"/bodeguita/icons/apple-launch-1125x2436.png",revision:"0e7673eed4e5a44a37e669f110f2a3f7"},{url:"/bodeguita/icons/apple-launch-1170x2532.png",revision:"9b3c033728c776a56cb0f8f72f8906c4"},{url:"/bodeguita/icons/apple-launch-1242x2208.png",revision:"7573413fdaca07a9c54488ca1b517b41"},{url:"/bodeguita/icons/apple-launch-1242x2688.png",revision:"272c2e1222ecfec8545be7ef282c3b1a"},{url:"/bodeguita/icons/apple-launch-1284x2778.png",revision:"e142de74f9263a22a461047b89057b32"},{url:"/bodeguita/icons/apple-launch-1536x2048.png",revision:"082fd55c9b49dbb7ad11101886387014"},{url:"/bodeguita/icons/apple-launch-1620x2160.png",revision:"5801abca5ef2a6224592bc253e72605e"},{url:"/bodeguita/icons/apple-launch-1668x2224.png",revision:"c5d762771c876603003b9f1b954d386c"},{url:"/bodeguita/icons/apple-launch-1668x2388.png",revision:"a611bde1214ad4a31ef00683af4efe9d"},{url:"/bodeguita/icons/apple-launch-2048x2732.png",revision:"a2b9dfd4e0fccbdd774d0c44799d85dd"},{url:"/bodeguita/icons/apple-launch-750x1334.png",revision:"7c37a6dd67066d39790daeb52c1b124b"},{url:"/bodeguita/icons/apple-launch-828x1792.png",revision:"0b213b76143e0f185aedbd7ce125405e"},{url:"/bodeguita/icons/favicon-128x128.png",revision:"1965bbbbf3561b3c8281c389b1abc7b5"},{url:"/bodeguita/icons/favicon-16x16.png",revision:"75d09c1aa977355a87c57e9a3c7a41df"},{url:"/bodeguita/icons/favicon-32x32.png",revision:"b29313b3171e225eec3d11bf23a762fe"},{url:"/bodeguita/icons/favicon-96x96.png",revision:"8f2d0530406997a1c81e7094432d5388"},{url:"/bodeguita/icons/icon-128x128.png",revision:"1965bbbbf3561b3c8281c389b1abc7b5"},{url:"/bodeguita/icons/icon-192x192.png",revision:"9dc51fcd66e4bc6bd3f0992cc17ec412"},{url:"/bodeguita/icons/icon-256x256.png",revision:"184a82ba7518bf2bfd7070ef0ea912ef"},{url:"/bodeguita/icons/icon-384x384.png",revision:"e518fadd6760a2522f6e63ab0742bde2"},{url:"/bodeguita/icons/icon-512x512.png",revision:"72055f5d460699ba9b4b330c681d27a0"},{url:"/bodeguita/icons/ms-icon-144x144.png",revision:"aaa367be3b0c23a59a5c7f602e29f2b4"},{url:"/bodeguita/icons/safari-pinned-tab.svg",revision:"bad7c3b53ed783aaac9e73712efdbdc9"},{url:"/bodeguita/index.html",revision:"f55918271787aae24be63218328ff4f8"},{url:"/bodeguita/js/2.99a347ec.js",revision:"8bd18908c0de4cce33250941483d43ab"},{url:"/bodeguita/js/3.99f62a87.js",revision:"bd6399c19fbc28fadcf08aa7ac0a915f"},{url:"/bodeguita/js/4.9d8da23b.js",revision:"7fe2a7e2082d2d70a6af6ca4354af11a"},{url:"/bodeguita/js/5.3b6fc238.js",revision:"6a778b85575101a9729e7d1e47a0acec"},{url:"/bodeguita/js/6.63fae227.js",revision:"1bcd3868020b62731d5454eb6e81565a"},{url:"/bodeguita/js/7.af62428a.js",revision:"0c57d0b6bfa2d71a52d6289fe75fc348"},{url:"/bodeguita/js/app.96ed7b18.js",revision:"274e83a7dee14169646ae025487de9b5"},{url:"/bodeguita/js/vendor.a4baa3b7.js",revision:"f0d12f1e88694bf1b441249e212f8fb9"},{url:"/bodeguita/manifest.json",revision:"b847059ba66f5b7260cafba9fc40980b"}],{}),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("/bodeguita/index.html"),{denylist:[/service-worker\.js$/,/workbox-(.)*\.js$/]}))}));
