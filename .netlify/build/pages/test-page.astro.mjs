/* empty css                                 */
import { e as createComponent, f as createAstro, i as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_9nBo-_fU.mjs';
import 'kleur/colors';
import 'html-escaper';
import { $ as $$Layout } from '../chunks/Layout_2Bm93tX_.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$TestPage = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$TestPage;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Test Page", "description": "A simple test page" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="py-12"> <div class="container mx-auto px-4 max-w-md"> <h1 class="text-3xl font-bold mb-6 text-center text-white">Test Page</h1> <p class="text-white text-center">This is a simple test page to check if Astro routing is working correctly.</p> </div> </section> ` })}`;
}, "C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/test-page.astro", void 0);

const $$file = "C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/test-page.astro";
const $$url = "/test-page";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$TestPage,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
