/* empty css                                 */
import { e as createComponent, i as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_9nBo-_fU.mjs';
import 'kleur/colors';
import 'html-escaper';
import { $ as $$Layout } from '../chunks/Layout_2Bm93tX_.mjs';
export { renderers } from '../renderers.mjs';

const $$CreatePost = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Create New Post - ABlog", "description": "Write and publish a new blog post on ABlog" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="py-12"> <div class="container mx-auto px-4 max-w-4xl"> ${renderComponent($$result2, "ClientCreatePostForm", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/amogh/Documents/augment-projects/ABlog/src/components/ClientCreatePostForm", "client:component-export": "default" })} </div> </section> ` })}`;
}, "C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/create-post.astro", void 0);

const $$file = "C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/create-post.astro";
const $$url = "/create-post";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$CreatePost,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
