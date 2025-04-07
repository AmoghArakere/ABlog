import { renderers } from './renderers.mjs';
import { s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_CvSoi7hX.mjs';
import { manifest } from './manifest_CfbmRx_M.mjs';
import { createExports } from '@astrojs/netlify/ssr-function.js';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/about.astro.mjs');
const _page2 = () => import('./pages/blogs/test-blog-post.astro.mjs');
const _page3 = () => import('./pages/blogs/_slug_.astro.mjs');
const _page4 = () => import('./pages/blogs.astro.mjs');
const _page5 = () => import('./pages/create-post.astro.mjs');
const _page6 = () => import('./pages/direct-edit.astro.mjs');
const _page7 = () => import('./pages/edit-post/_slug_.astro.mjs');
const _page8 = () => import('./pages/edit-post.astro.mjs');
const _page9 = () => import('./pages/forgot-password.astro.mjs');
const _page10 = () => import('./pages/login.astro.mjs');
const _page11 = () => import('./pages/profile.astro.mjs');
const _page12 = () => import('./pages/register.astro.mjs');
const _page13 = () => import('./pages/reset-password.astro.mjs');
const _page14 = () => import('./pages/simple-edit.astro.mjs');
const _page15 = () => import('./pages/test-page.astro.mjs');
const _page16 = () => import('./pages/user/_username_.astro.mjs');
const _page17 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/about.astro", _page1],
    ["src/pages/blogs/test-blog-post.astro", _page2],
    ["src/pages/blogs/[slug].astro", _page3],
    ["src/pages/blogs/index.astro", _page4],
    ["src/pages/create-post.astro", _page5],
    ["src/pages/direct-edit.astro", _page6],
    ["src/pages/edit-post/[slug].astro", _page7],
    ["src/pages/edit-post.astro", _page8],
    ["src/pages/forgot-password.astro", _page9],
    ["src/pages/login.astro", _page10],
    ["src/pages/profile.astro", _page11],
    ["src/pages/register.astro", _page12],
    ["src/pages/reset-password.astro", _page13],
    ["src/pages/simple-edit.astro", _page14],
    ["src/pages/test-page.astro", _page15],
    ["src/pages/user/[username].astro", _page16],
    ["src/pages/index.astro", _page17]
]);
const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./_noop-actions.mjs'),
    middleware: undefined
});
const _args = {
    "middlewareSecret": "3ce54ccd-1fd6-4b21-9218-c5fcb2e0bd91"
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (_start in serverEntrypointModule) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { __astrojsSsrVirtualEntry as default, pageMap };
