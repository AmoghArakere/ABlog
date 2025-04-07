/* empty css                                 */
import { e as createComponent, i as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_9nBo-_fU.mjs';
import 'kleur/colors';
import 'html-escaper';
import { $ as $$Layout } from '../chunks/Layout_2Bm93tX_.mjs';
export { renderers } from '../renderers.mjs';

const $$Register = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Register - ABlog", "description": "Create a new ABlog account" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="py-12"> <div class="container mx-auto px-4 max-w-md"> ${renderComponent($$result2, "ClientRegisterForm", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/amogh/Documents/augment-projects/ABlog/src/components/ClientRegisterForm", "client:component-export": "default" })} </div> </section> ` })}`;
}, "C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/register.astro", void 0);

const $$file = "C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/register.astro";
const $$url = "/register";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Register,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
