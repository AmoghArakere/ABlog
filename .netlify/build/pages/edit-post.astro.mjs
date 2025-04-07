/* empty css                                 */
import { e as createComponent, i as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_9nBo-_fU.mjs';
import 'kleur/colors';
import 'html-escaper';
import { a as authService, $ as $$Layout } from '../chunks/Layout_2Bm93tX_.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { b as blogService } from '../chunks/localStorageService_BSOMlJt7.mjs';
import { C as ClientEditPostForm, a as Card } from '../chunks/ClientEditPostForm_De2W5VEC.mjs';
export { renderers } from '../renderers.mjs';

function ClientEditPostSelector() {
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        setLoading(true);
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        if (!currentUser) {
          setError("You must be logged in to edit posts");
          setLoading(false);
          return;
        }
        console.log("Fetching posts for user:", currentUser.id);
        const result = await blogService.getAllPosts();
        const filteredPosts = result.posts.filter((post) => post.author_id === currentUser.id);
        console.log("User posts found:", filteredPosts.length);
        setUserPosts(filteredPosts);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user posts:", err);
        setError("Failed to load your posts");
        setLoading(false);
      }
    };
    fetchUserPosts();
  }, []);
  const handleSelectPost = (post) => {
    console.log("Selected post for editing:", post.id);
    setSelectedPost(post);
  };
  if (loading) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-text-muted", children: "Loading your posts..." })
    ] });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("div", { className: "bg-red-50 text-red-500 p-6 rounded-lg", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xl font-semibold", children: error }),
      /* @__PURE__ */ jsx("p", { className: "mt-2", children: "Please try again later or contact support." }),
      /* @__PURE__ */ jsx("a", { href: "/blogs", className: "mt-4 inline-block px-4 py-2 bg-primary text-white rounded-md", children: "Browse All Posts" })
    ] });
  }
  if (!user) {
    return /* @__PURE__ */ jsxs("div", { className: "bg-yellow-50 text-yellow-700 p-6 rounded-lg", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xl font-semibold", children: "You need to be logged in to edit posts" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2", children: "Please log in to continue." }),
      /* @__PURE__ */ jsx("a", { href: "/login", className: "mt-4 inline-block px-4 py-2 bg-primary text-white rounded-md", children: "Log In" })
    ] });
  }
  if (selectedPost) {
    return /* @__PURE__ */ jsx(ClientEditPostForm, { post: selectedPost });
  }
  if (userPosts.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 text-blue-700 p-6 rounded-lg", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xl font-semibold", children: "You don't have any posts yet" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2", children: "Create your first post to get started." }),
      /* @__PURE__ */ jsx("a", { href: "/create-post", className: "mt-4 inline-block px-4 py-2 bg-primary text-white rounded-md", children: "Create Post" })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold mb-4", children: "Select a post to edit" }),
    /* @__PURE__ */ jsx("div", { className: "grid gap-4", children: userPosts.map((post) => /* @__PURE__ */ jsx(
      Card,
      {
        className: "p-4 cursor-pointer hover:bg-gray-50 transition-colors",
        onClick: () => handleSelectPost(post),
        children: /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
          post.cover_image && /* @__PURE__ */ jsx("div", { className: "w-16 h-16 mr-4 rounded overflow-hidden bg-gray-100", children: /* @__PURE__ */ jsx(
            "img",
            {
              src: post.cover_image,
              alt: post.title,
              className: "w-full h-full object-cover",
              onError: (e) => {
                e.target.style.display = "none";
              }
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-medium", children: post.title }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500", children: [
              new Date(post.created_at).toLocaleDateString(),
              " • ",
              post.status
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "ml-4", children: /* @__PURE__ */ jsx("button", { className: "p-2 rounded-full bg-gray-100 hover:bg-gray-200", children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" }) }) }) })
        ] })
      },
      post.id
    )) })
  ] });
}

const prerender = false;
const $$EditPost = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Edit Post - ABlog", "description": "Edit your blog post" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-4xl mx-auto py-8"> <h1 class="text-3xl font-bold mb-8">Edit Post</h1> ${renderComponent($$result2, "ClientEditPostSelector", ClientEditPostSelector, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/amogh/Documents/augment-projects/ABlog/src/components/ClientEditPostSelector", "client:component-export": "default" })} </div> ` })}`;
}, "C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/edit-post.astro", void 0);

const $$file = "C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/edit-post.astro";
const $$url = "/edit-post";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$EditPost,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
