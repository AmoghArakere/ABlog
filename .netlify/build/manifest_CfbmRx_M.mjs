import '@astrojs/internal-helpers/path';
import 'kleur/colors';
import 'html-escaper';
import 'clsx';
import { n as NOOP_MIDDLEWARE_HEADER, o as decodeKey } from './chunks/astro/server_9nBo-_fU.mjs';
import 'cookie';
import 'es-module-lexer';

const NOOP_MIDDLEWARE_FN = async (_ctx, next) => {
  const response = await next();
  response.headers.set(NOOP_MIDDLEWARE_HEADER, "true");
  return response;
};

const codeToStatusMap = {
  // Implemented from tRPC error code table
  // https://trpc.io/docs/server/error-handling#error-codes
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TIMEOUT: 405,
  CONFLICT: 409,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  UNPROCESSABLE_CONTENT: 422,
  TOO_MANY_REQUESTS: 429,
  CLIENT_CLOSED_REQUEST: 499,
  INTERNAL_SERVER_ERROR: 500
};
Object.entries(codeToStatusMap).reduce(
  // reverse the key-value pairs
  (acc, [key, value]) => ({ ...acc, [value]: key }),
  {}
);

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///C:/Users/amogh/Documents/augment-projects/ABlog/","cacheDir":"file:///C:/Users/amogh/Documents/augment-projects/ABlog/node_modules/.astro/","outDir":"file:///C:/Users/amogh/Documents/augment-projects/ABlog/dist/","srcDir":"file:///C:/Users/amogh/Documents/augment-projects/ABlog/src/","publicDir":"file:///C:/Users/amogh/Documents/augment-projects/ABlog/public/","buildClientDir":"file:///C:/Users/amogh/Documents/augment-projects/ABlog/dist/","buildServerDir":"file:///C:/Users/amogh/Documents/augment-projects/ABlog/.netlify/build/","adapterName":"@astrojs/netlify","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/about.DudMZ09V.css"}],"routeData":{"route":"/about","isIndex":false,"type":"page","pattern":"^\\/about\\/?$","segments":[[{"content":"about","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/about.astro","pathname":"/about","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/about.DudMZ09V.css"},{"type":"inline","content":".giscus-wrapper[data-astro-cid-an2nl7ar]{margin-top:2rem}\n"}],"routeData":{"route":"/blogs/test-blog-post","isIndex":false,"type":"page","pattern":"^\\/blogs\\/test-blog-post\\/?$","segments":[[{"content":"blogs","dynamic":false,"spread":false}],[{"content":"test-blog-post","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/blogs/test-blog-post.astro","pathname":"/blogs/test-blog-post","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/about.DudMZ09V.css"}],"routeData":{"route":"/blogs/[slug]","isIndex":false,"type":"page","pattern":"^\\/blogs\\/([^/]+?)\\/?$","segments":[[{"content":"blogs","dynamic":false,"spread":false}],[{"content":"slug","dynamic":true,"spread":false}]],"params":["slug"],"component":"src/pages/blogs/[slug].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/about.DudMZ09V.css"}],"routeData":{"route":"/blogs","isIndex":true,"type":"page","pattern":"^\\/blogs\\/?$","segments":[[{"content":"blogs","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/blogs/index.astro","pathname":"/blogs","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/about.DudMZ09V.css"}],"routeData":{"route":"/create-post","isIndex":false,"type":"page","pattern":"^\\/create-post\\/?$","segments":[[{"content":"create-post","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/create-post.astro","pathname":"/create-post","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/about.DudMZ09V.css"}],"routeData":{"route":"/direct-edit","isIndex":false,"type":"page","pattern":"^\\/direct-edit\\/?$","segments":[[{"content":"direct-edit","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/direct-edit.astro","pathname":"/direct-edit","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/about.DudMZ09V.css"}],"routeData":{"route":"/edit-post/[slug]","isIndex":false,"type":"page","pattern":"^\\/edit-post\\/([^/]+?)\\/?$","segments":[[{"content":"edit-post","dynamic":false,"spread":false}],[{"content":"slug","dynamic":true,"spread":false}]],"params":["slug"],"component":"src/pages/edit-post/[slug].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/about.DudMZ09V.css"}],"routeData":{"route":"/edit-post","isIndex":false,"type":"page","pattern":"^\\/edit-post\\/?$","segments":[[{"content":"edit-post","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/edit-post.astro","pathname":"/edit-post","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/about.DudMZ09V.css"}],"routeData":{"route":"/forgot-password","isIndex":false,"type":"page","pattern":"^\\/forgot-password\\/?$","segments":[[{"content":"forgot-password","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/forgot-password.astro","pathname":"/forgot-password","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/about.DudMZ09V.css"}],"routeData":{"route":"/login","isIndex":false,"type":"page","pattern":"^\\/login\\/?$","segments":[[{"content":"login","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/login.astro","pathname":"/login","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/about.DudMZ09V.css"}],"routeData":{"route":"/profile","isIndex":false,"type":"page","pattern":"^\\/profile\\/?$","segments":[[{"content":"profile","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/profile.astro","pathname":"/profile","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/about.DudMZ09V.css"}],"routeData":{"route":"/register","isIndex":false,"type":"page","pattern":"^\\/register\\/?$","segments":[[{"content":"register","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/register.astro","pathname":"/register","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/about.DudMZ09V.css"}],"routeData":{"route":"/reset-password","isIndex":false,"type":"page","pattern":"^\\/reset-password\\/?$","segments":[[{"content":"reset-password","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/reset-password.astro","pathname":"/reset-password","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/about.DudMZ09V.css"}],"routeData":{"route":"/simple-edit","isIndex":false,"type":"page","pattern":"^\\/simple-edit\\/?$","segments":[[{"content":"simple-edit","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/simple-edit.astro","pathname":"/simple-edit","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/about.DudMZ09V.css"}],"routeData":{"route":"/test-page","isIndex":false,"type":"page","pattern":"^\\/test-page\\/?$","segments":[[{"content":"test-page","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/test-page.astro","pathname":"/test-page","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/about.DudMZ09V.css"}],"routeData":{"route":"/user/[username]","isIndex":false,"type":"page","pattern":"^\\/user\\/([^/]+?)\\/?$","segments":[[{"content":"user","dynamic":false,"spread":false}],[{"content":"username","dynamic":true,"spread":false}]],"params":["username"],"component":"src/pages/user/[username].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/about.DudMZ09V.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/about.astro",{"propagation":"none","containsHead":true}],["C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/blogs/[slug].astro",{"propagation":"none","containsHead":true}],["C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/blogs/index.astro",{"propagation":"none","containsHead":true}],["C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/blogs/test-blog-post.astro",{"propagation":"none","containsHead":true}],["C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/create-post.astro",{"propagation":"none","containsHead":true}],["C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/direct-edit.astro",{"propagation":"none","containsHead":true}],["C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/edit-post.astro",{"propagation":"none","containsHead":true}],["C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/edit-post/[slug].astro",{"propagation":"none","containsHead":true}],["C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/forgot-password.astro",{"propagation":"none","containsHead":true}],["C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/index.astro",{"propagation":"none","containsHead":true}],["C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/login.astro",{"propagation":"none","containsHead":true}],["C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/profile.astro",{"propagation":"none","containsHead":true}],["C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/register.astro",{"propagation":"none","containsHead":true}],["C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/reset-password.astro",{"propagation":"none","containsHead":true}],["C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/simple-edit.astro",{"propagation":"none","containsHead":true}],["C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/test-page.astro",{"propagation":"none","containsHead":true}],["C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/user/[username].astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000noop-actions":"_noop-actions.mjs","\u0000@astro-page:src/pages/about@_@astro":"pages/about.astro.mjs","\u0000@astro-page:src/pages/blogs/test-blog-post@_@astro":"pages/blogs/test-blog-post.astro.mjs","\u0000@astro-page:src/pages/blogs/[slug]@_@astro":"pages/blogs/_slug_.astro.mjs","\u0000@astro-page:src/pages/blogs/index@_@astro":"pages/blogs.astro.mjs","\u0000@astro-page:src/pages/create-post@_@astro":"pages/create-post.astro.mjs","\u0000@astro-page:src/pages/direct-edit@_@astro":"pages/direct-edit.astro.mjs","\u0000@astro-page:src/pages/edit-post/[slug]@_@astro":"pages/edit-post/_slug_.astro.mjs","\u0000@astro-page:src/pages/edit-post@_@astro":"pages/edit-post.astro.mjs","\u0000@astro-page:src/pages/forgot-password@_@astro":"pages/forgot-password.astro.mjs","\u0000@astro-page:src/pages/login@_@astro":"pages/login.astro.mjs","\u0000@astro-page:src/pages/profile@_@astro":"pages/profile.astro.mjs","\u0000@astro-page:src/pages/register@_@astro":"pages/register.astro.mjs","\u0000@astro-page:src/pages/reset-password@_@astro":"pages/reset-password.astro.mjs","\u0000@astro-page:src/pages/simple-edit@_@astro":"pages/simple-edit.astro.mjs","\u0000@astro-page:src/pages/test-page@_@astro":"pages/test-page.astro.mjs","\u0000@astro-page:src/pages/user/[username]@_@astro":"pages/user/_username_.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_CfbmRx_M.mjs","C:/Users/amogh/Documents/augment-projects/ABlog/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_bvEPNHgy.mjs","C:/Users/amogh/Documents/augment-projects/ABlog/src/components/DirectEditForm":"_astro/DirectEditForm.DgZj_wt8.js","C:/Users/amogh/Documents/augment-projects/ABlog/src/components/ClientEditPostSelector":"_astro/ClientEditPostSelector.DN3ByEnN.js","C:/Users/amogh/Documents/augment-projects/ABlog/src/components/SimpleEditForm":"_astro/SimpleEditForm.DoE8v_NP.js","C:/Users/amogh/Documents/augment-projects/ABlog/src/components/Footer":"_astro/Footer.GFFfqmAY.js","C:/Users/amogh/Documents/augment-projects/ABlog/src/components/ClientBlogPostList":"_astro/ClientBlogPostList.DA-Hv07e.js","C:/Users/amogh/Documents/augment-projects/ABlog/src/components/ClientCreatePostForm":"_astro/ClientCreatePostForm.BkbUB1Z4.js","C:/Users/amogh/Documents/augment-projects/ABlog/src/components/ClientLoginForm":"_astro/ClientLoginForm.CQzxwu61.js","C:/Users/amogh/Documents/augment-projects/ABlog/src/components/CurrentUserProfile":"_astro/CurrentUserProfile.CC3GHs7H.js","C:/Users/amogh/Documents/augment-projects/ABlog/src/components/ClientRegisterForm":"_astro/ClientRegisterForm.C-bdUX87.js","C:/Users/amogh/Documents/augment-projects/ABlog/src/components/FeaturedPosts":"_astro/FeaturedPosts.DoH2IRo2.js","C:/Users/amogh/Documents/augment-projects/ABlog/src/components/CategorySection":"_astro/CategorySection.DMCoI9t6.js","C:/Users/amogh/Documents/augment-projects/ABlog/src/components/AuthCTA":"_astro/AuthCTA.DxnMSKRQ.js","C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/forgot-password.astro?astro&type=script&index=0&lang.ts":"_astro/forgot-password.astro_astro_type_script_index_0_lang.LJ0ZFF3H.js","C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/reset-password.astro?astro&type=script&index=0&lang.ts":"_astro/reset-password.astro_astro_type_script_index_0_lang.Dy2AZb0I.js","C:/Users/amogh/Documents/augment-projects/ABlog/src/components/DataFixer":"_astro/DataFixer.NoVx0tv4.js","C:/Users/amogh/Documents/augment-projects/ABlog/src/components/PageTransitionWrapper":"_astro/PageTransitionWrapper.DucRNvQ7.js","C:/Users/amogh/Documents/augment-projects/ABlog/src/components/HomeHero":"_astro/HomeHero.OQnuK987.js","C:/Users/amogh/Documents/augment-projects/ABlog/src/components/App":"_astro/App.DQGb0IwR.js","C:/Users/amogh/Documents/augment-projects/ABlog/src/components/ClientBlogPost":"_astro/ClientBlogPost.cpCFS66B.js","@astrojs/react/client.js":"_astro/client.pBrIeLay.js","C:/Users/amogh/Documents/augment-projects/ABlog/src/components/NavigationWrapper":"_astro/NavigationWrapper.BiOwB-c2.js","C:/Users/amogh/Documents/augment-projects/ABlog/src/lib/authService.js":"_astro/authService.DqVayKcm.js","C:/Users/amogh/Documents/augment-projects/ABlog/src/components/ClientUserProfileWrapper":"_astro/ClientUserProfileWrapper.CsCRN1cs.js","C:/Users/amogh/Documents/augment-projects/ABlog/src/components/ClientEditPostForm":"_astro/ClientEditPostForm.DmObiILF.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/about.DudMZ09V.css","/favicon.svg","/images/placeholder-blog.svg","/images/placeholder-cover.svg","/images/placeholder-profile.svg","/_astro/App.DQGb0IwR.js","/_astro/AuthCTA.DxnMSKRQ.js","/_astro/authService.DqVayKcm.js","/_astro/button.DzVaDjt9.js","/_astro/CategorySection.DMCoI9t6.js","/_astro/client.pBrIeLay.js","/_astro/ClientBlogPost.cpCFS66B.js","/_astro/ClientBlogPostCard.CZYMmUud.js","/_astro/ClientBlogPostList.DA-Hv07e.js","/_astro/ClientCreatePostForm.BkbUB1Z4.js","/_astro/ClientEditPostForm.B8GY8xVb.js","/_astro/ClientEditPostForm.DmObiILF.js","/_astro/ClientEditPostSelector.DN3ByEnN.js","/_astro/ClientLoginForm.CQzxwu61.js","/_astro/ClientRegisterForm.C-bdUX87.js","/_astro/ClientUserProfileWrapper.CsCRN1cs.js","/_astro/CurrentUserProfile.CC3GHs7H.js","/_astro/DataFixer.NoVx0tv4.js","/_astro/DirectEditForm.DgZj_wt8.js","/_astro/FeaturedPosts.DoH2IRo2.js","/_astro/Footer.GFFfqmAY.js","/_astro/forgot-password.astro_astro_type_script_index_0_lang.LJ0ZFF3H.js","/_astro/HomeHero.OQnuK987.js","/_astro/ImageUploader.C9fsACBt.js","/_astro/index.BZ-xZ17_.js","/_astro/index.C0PbZYII.js","/_astro/index.CmCV0CJW.js","/_astro/index.D6WNuTJb.js","/_astro/index.hImVfIb4.js","/_astro/jsx-runtime.DtK_NGcS.js","/_astro/localStorageService.BfBerrd2.js","/_astro/NavigationContext.B3VOCCjE.js","/_astro/NavigationWrapper.BiOwB-c2.js","/_astro/PageTransitionWrapper.DucRNvQ7.js","/_astro/preload-helper.CLcXU_4U.js","/_astro/reset-password.astro_astro_type_script_index_0_lang.Dy2AZb0I.js","/_astro/RichTextEditor.CeNDHKCl.js","/_astro/SimpleEditForm.DoE8v_NP.js","/_astro/ToastContext.zMZrZPjH.js","/_astro/utils.DDJ-EckY.js","/_astro/_commonjsHelpers.gnU0ypJ3.js"],"buildFormat":"directory","checkOrigin":true,"serverIslandNameMap":[],"key":"Pi7/VEOMTmWFUUKGpzEyU8l/+wAf5JAZdyqcvrroHKg="});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = null;

export { manifest };
