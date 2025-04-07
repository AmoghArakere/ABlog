/* empty css                                    */
import { e as createComponent, f as createAstro, r as renderTemplate, h as addAttribute, m as maybeRenderHead, i as renderComponent } from '../../chunks/astro/server_9nBo-_fU.mjs';
import 'kleur/colors';
import 'html-escaper';
import { $ as $$Layout } from '../../chunks/Layout_2Bm93tX_.mjs';
import 'clsx';
/* empty css                                             */
export { renderers } from '../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$Giscus = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Giscus;
  const {
    repo,
    repoId,
    category,
    categoryId,
    mapping,
    term = "",
    strict = "0",
    reactionsEnabled = "1",
    emitMetadata = "0",
    inputPosition = "bottom",
    theme = "light",
    lang = "en",
    loading = "lazy"
  } = Astro2.props;
  return renderTemplate(_a || (_a = __template(["", '<div class="giscus-wrapper" data-astro-cid-an2nl7ar> <script src="https://giscus.app/client.js"', "", "", "", "", "", "", "", "", "", "", "", ' crossorigin="anonymous" async><\/script> </div> '])), maybeRenderHead(), addAttribute(repo, "data-repo"), addAttribute(repoId, "data-repo-id"), addAttribute(category, "data-category"), addAttribute(categoryId, "data-category-id"), addAttribute(mapping, "data-mapping"), addAttribute(strict, "data-strict"), addAttribute(reactionsEnabled, "data-reactions-enabled"), addAttribute(emitMetadata, "data-emit-metadata"), addAttribute(inputPosition, "data-input-position"), addAttribute(theme, "data-theme"), addAttribute(lang, "data-lang"), addAttribute(loading, "data-loading"));
}, "C:/Users/amogh/Documents/augment-projects/ABlog/src/components/Giscus.astro", void 0);

const $$TestBlogPost = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Test Blog Post - ABlog", "description": "This is a test blog post." }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<article class="py-12"> <div class="container mx-auto px-4 max-w-4xl"> <div class="mb-8"> <div class="flex items-center mb-4"> <a href="/blogs" class="text-primary hover:underline flex items-center"> <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path> </svg>
Back to Blogs
</a> </div> <h1 class="text-4xl font-bold mb-4">Test Blog Post</h1> <div class="flex items-center mb-6"> <div class="flex items-center"> <div class="w-10 h-10 bg-gray-200 rounded-full"></div> <div class="ml-3"> <p class="text-sm font-medium">John Doe</p> <p class="text-xs text-text-muted">April 1, 2025 · 5 min read</p> </div> </div> </div> </div> <div class="prose max-w-none"> <p class="text-lg mb-6">
This is a test blog post to check if there are any syntax issues.
</p> </div> <div class="mt-12 pt-8 border-t border-gray-200"> <h3 class="text-2xl font-semibold mb-6">Comments</h3> ${renderComponent($$result2, "Giscus", $$Giscus, { "repo": "username/repo-name", "repoId": "R_kgDOLXXXXX", "category": "Announcements", "categoryId": "DIC_kwDOLXXXXXXXXX", "mapping": "pathname", "reactionsEnabled": "1", "emitMetadata": "0", "inputPosition": "top", "theme": "light", "lang": "en", "loading": "lazy" })} </div> </div> </article> ` })}`;
}, "C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/blogs/test-blog-post.astro", void 0);

const $$file = "C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/blogs/test-blog-post.astro";
const $$url = "/blogs/test-blog-post";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$TestBlogPost,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
