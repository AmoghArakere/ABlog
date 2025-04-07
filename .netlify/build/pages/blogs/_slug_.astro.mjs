/* empty css                                    */
import { e as createComponent, f as createAstro, i as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_9nBo-_fU.mjs';
import 'kleur/colors';
import 'html-escaper';
import { $ as $$Layout } from '../../chunks/Layout_2Bm93tX_.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const prerender = false;
const $$slug = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const { slug } = Astro2.params;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Blog Post - ABlog", "description": "Read this blog post on ABlog" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="py-12"> <div class="container mx-auto px-4"> ${renderComponent($$result2, "ClientBlogPost", null, { "slug": slug, "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/amogh/Documents/augment-projects/ABlog/src/components/ClientBlogPost", "client:component-export": "default" })} </div> </section> ` })}`;
}, "C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/blogs/[slug].astro", void 0);

const $$file = "C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/blogs/[slug].astro";
const $$url = "/blogs/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$slug,
    file: $$file,
    prerender,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
