if(!self.define){let e,i={};const s=(s,n)=>(s=new URL(s+".js",n).href,i[s]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=i,document.head.appendChild(e)}else e=s,importScripts(s),i()})).then((()=>{let e=i[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(n,r)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(i[o])return;let c={};const t=e=>s(e,o),d={module:{uri:o},exports:c,require:t};i[o]=Promise.all(n.map((e=>d[e]||t(e)))).then((e=>(r(...e),c)))}}define(["./workbox-27b29e6f"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"assets/index-d09157da.js",revision:null},{url:"assets/index-e3b0c442.css",revision:null},{url:"index.html",revision:"e83d98640d86f5b295c5c420fed0d739"},{url:"registerSW.js",revision:"402b66900e731ca748771b6fc5e7a068"},{url:"apple-icon-180.png",revision:"719b92c3f4a8015d6d70150a574161c1"},{url:"maskable_icon.png",revision:"d4dd3906c4d13be25771ccf356f3cbc5"},{url:"maskable_icon-512.png",revision:"745dc27dd8e97187af372462a0f01a02"},{url:"manifest.webmanifest",revision:"a4b36622126ec8bcf99f9d6faf560ef6"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
