/* empty css                                    */
import { e as createComponent, f as createAstro, i as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_9nBo-_fU.mjs';
import 'kleur/colors';
import 'html-escaper';
import { $ as $$Layout } from '../../chunks/Layout_2Bm93tX_.mjs';
import { C as ClientEditPostForm } from '../../chunks/ClientEditPostForm_De2W5VEC.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const prerender = false;
const $$slug = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const { slug } = Astro2.params;
  console.log("Server-side slug parameter:", slug);
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Edit Post - ABlog", "description": "Edit your blog post" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-4xl mx-auto py-8"> <h1 class="text-3xl font-bold mb-8">Edit Post</h1> ${renderComponent($$result2, "ClientEditPostForm", ClientEditPostForm, { "client:load": true, "slug": slug, "client:component-hydration": "load", "client:component-path": "C:/Users/amogh/Documents/augment-projects/ABlog/src/components/ClientEditPostForm", "client:component-export": "default" })} </div> ` })}`;
}, "C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/edit-post/[slug].astro", void 0);

const $$file = "C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/edit-post/[slug].astro";
const $$url = "/edit-post/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
