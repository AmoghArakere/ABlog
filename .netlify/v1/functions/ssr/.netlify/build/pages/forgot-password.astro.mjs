/* empty css                                 */
import { e as createComponent, i as renderComponent, r as renderTemplate, m as maybeRenderHead, j as renderScript } from '../chunks/astro/server_9nBo-_fU.mjs';
import 'kleur/colors';
import 'html-escaper';
import { $ as $$Layout } from '../chunks/Layout_2Bm93tX_.mjs';
export { renderers } from '../renderers.mjs';

const $$ForgotPassword = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Forgot Password - ABlog", "description": "Reset your ABlog account password" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="py-12"> <div class="container mx-auto px-4 max-w-md"> <div class="bg-black rounded-lg shadow-md p-8 border border-gray-800 text-white"> <div class="text-center mb-8"> <h1 class="text-3xl font-bold mb-2 text-white">Forgot Password</h1> <p class="text-gray-400">Enter your email to reset your password</p> </div> <form id="forgotPasswordForm" class="space-y-6"> <div> <label for="email" class="block text-sm font-medium mb-2 text-gray-300">Email</label> <input type="email" id="email" placeholder="Enter your email" class="w-full px-4 py-2 bg-gray-900 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent" required> </div> <div id="errorMessage" class="bg-red-900/30 text-red-400 p-4 rounded-md mb-6 border border-red-800 hidden">
Error message will appear here
</div> <div id="successMessage" class="bg-green-900/30 text-green-400 p-4 rounded-md mb-6 border border-green-800 hidden">
Success message will appear here
</div> <button type="submit" class="w-full py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
Reset Password
</button> </form> <div class="mt-6 text-center"> <p class="text-sm text-gray-400">
Remember your password? <a href="/login" class="text-purple-400 hover:underline">Sign in</a> </p> </div> ${renderScript($$result2, "C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/forgot-password.astro?astro&type=script&index=0&lang.ts")} </div> </div> </section> ` })}`;
}, "C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/forgot-password.astro", void 0);

const $$file = "C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/forgot-password.astro";
const $$url = "/forgot-password";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$ForgotPassword,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
