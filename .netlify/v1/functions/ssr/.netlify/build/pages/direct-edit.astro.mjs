/* empty css                                 */
import { e as createComponent, i as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_9nBo-_fU.mjs';
import 'kleur/colors';
import 'html-escaper';
import { $ as $$Layout } from '../chunks/Layout_2Bm93tX_.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { R as RichTextEditor, I as ImageUploader } from '../chunks/ImageUploader_Okv_sFRG.mjs';
export { renderers } from '../renderers.mjs';

function DirectEditForm() {
  const [currentUser, setCurrentUser] = useState(null);
  const [allPosts, setAllPosts] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState("published");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    try {
      const userJson = localStorage.getItem("currentUser");
      console.log("User JSON from localStorage:", userJson);
      if (userJson) {
        const user = JSON.parse(userJson);
        setCurrentUser(user);
        console.log("Current user loaded:", user);
      } else {
        setError("You must be logged in to edit posts");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error loading user:", err);
      setError("Failed to load user data");
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (!currentUser) return;
    try {
      const postsJson = localStorage.getItem("posts");
      console.log("Posts JSON from localStorage:", postsJson ? postsJson.substring(0, 100) + "..." : "null");
      if (postsJson) {
        const posts = JSON.parse(postsJson);
        setAllPosts(posts);
        const filteredPosts = posts.filter((post) => post.author_id === currentUser.id);
        console.log("Found", filteredPosts.length, "posts for user", currentUser.id);
        setUserPosts(filteredPosts);
      } else {
        console.log("No posts found in localStorage");
        setUserPosts([]);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error loading posts:", err);
      setError("Failed to load posts data");
      setLoading(false);
    }
  }, [currentUser]);
  const handleSelectPost = (postId) => {
    console.log("Selected post ID:", postId);
    setSelectedPostId(postId);
    const post = userPosts.find((p) => p.id === postId);
    if (post) {
      console.log("Found selected post:", post);
      setSelectedPost(post);
      setTitle(post.title || "");
      setContent(post.content || "");
      setCoverImage(post.cover_image || "");
      setStatus(post.status || "published");
      setError("");
      setMessage("");
    } else {
      console.error("Post not found with ID:", postId);
      setError("Post not found");
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedPost) {
      setError("No post selected for editing");
      return;
    }
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    try {
      setSaving(true);
      setError("");
      setMessage("");
      const updatedPost = {
        ...selectedPost,
        title,
        content,
        cover_image: selectedPost.cover_image,
        // Use the cover image from the selectedPost state
        status,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      const updatedPosts = allPosts.map(
        (post) => post.id === selectedPost.id ? updatedPost : post
      );
      localStorage.setItem("posts", JSON.stringify(updatedPosts));
      setAllPosts(updatedPosts);
      setUserPosts(updatedPosts.filter((post) => post.author_id === currentUser.id));
      setSelectedPost(updatedPost);
      setMessage("Post updated successfully!");
      console.log("Post updated successfully:", updatedPost);
    } catch (err) {
      console.error("Error updating post:", err);
      setError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-gray-600", children: "Loading data..." })
    ] });
  }
  if (error && !currentUser) {
    return /* @__PURE__ */ jsxs("div", { className: "bg-yellow-50 text-yellow-700 p-6 rounded-lg", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xl font-semibold", children: error }),
      /* @__PURE__ */ jsx("p", { className: "mt-2", children: "Please log in to continue." }),
      /* @__PURE__ */ jsx("a", { href: "/login", className: "mt-4 inline-block px-4 py-2 bg-primary text-white rounded-md", children: "Log In" })
    ] });
  }
  if (userPosts.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 text-blue-700 p-6 rounded-lg", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xl font-semibold", children: "You don't have any posts yet" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2", children: "Create your first post to get started." }),
      /* @__PURE__ */ jsx("a", { href: "/create-post", className: "mt-4 inline-block px-4 py-2 bg-primary text-white rounded-md", children: "Create Post" })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [
    /* @__PURE__ */ jsx("div", { className: "md:col-span-1", children: /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-slate-800 rounded-lg shadow p-4 dark:border dark:border-slate-700", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold mb-4 dark:text-white", children: "Your Posts" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-2", children: userPosts.map((post) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: `p-3 rounded-md cursor-pointer transition-colors ${selectedPostId === post.id ? "bg-primary text-white" : "bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white"}`,
          onClick: () => handleSelectPost(post.id),
          children: [
            /* @__PURE__ */ jsx("h3", { className: "font-medium truncate", children: post.title }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs opacity-80", children: [
              new Date(post.created_at).toLocaleDateString(),
              " • ",
              post.status
            ] })
          ]
        },
        post.id
      )) })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "md:col-span-2", children: !selectedPost ? /* @__PURE__ */ jsx("div", { className: "bg-white dark:bg-slate-800 rounded-lg shadow p-6 text-center dark:border dark:border-slate-700", children: /* @__PURE__ */ jsx("p", { className: "text-gray-600 dark:text-gray-300", children: "Select a post from the list to edit" }) }) : /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-slate-800 rounded-lg shadow p-6 dark:border dark:border-slate-700", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold mb-6 dark:text-white", children: "Edit Post" }),
      error && /* @__PURE__ */ jsx("div", { className: "bg-red-50 text-red-600 p-4 rounded-md mb-4", children: error }),
      message && /* @__PURE__ */ jsx("div", { className: "bg-green-50 text-green-600 p-4 rounded-md mb-4", children: message }),
      /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "title", className: "block text-sm font-medium mb-2 dark:text-white", children: "Title" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "title",
              type: "text",
              value: title,
              onChange: (e) => setTitle(e.target.value),
              className: "w-full rounded-md border border-gray-300 dark:border-slate-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-700 dark:text-white",
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "content", className: "block text-sm font-medium mb-2 dark:text-white", children: "Content" }),
          /* @__PURE__ */ jsx(RichTextEditor, { content, onChange: setContent }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: [
            "Use markdown formatting for rich text. For blockquotes, use the quote button or start a line with ",
            /* @__PURE__ */ jsx("code", { className: "bg-gray-100 dark:bg-slate-700 px-1 rounded dark:text-white", children: ">" }),
            " (greater than symbol)."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "coverImage", className: "block text-sm font-medium mb-2 dark:text-white", children: "Cover Image" }),
          /* @__PURE__ */ jsx(
            ImageUploader,
            {
              onImageSelect: (imageData) => {
                console.log("Image selected, data length:", imageData ? imageData.length : 0);
                if (selectedPost) {
                  setSelectedPost({
                    ...selectedPost,
                    cover_image: imageData
                  });
                }
              },
              buttonText: "Upload Cover Image",
              initialImage: selectedPost?.cover_image
            }
          ),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: "Upload an image to use as the cover for your post. The image will be displayed at the top of your post." }),
          selectedPost?.cover_image && /* @__PURE__ */ jsx("div", { className: "mt-4 border dark:border-slate-600 rounded-md overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "relative h-48 bg-gray-100 dark:bg-slate-700", children: /* @__PURE__ */ jsx(
            "img",
            {
              src: selectedPost.cover_image,
              alt: "Cover preview",
              className: "h-full w-full object-cover",
              onError: (e) => {
                e.target.style.display = "none";
              }
            }
          ) }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "status", className: "block text-sm font-medium mb-2 dark:text-white", children: "Status" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "status",
              value: status,
              onChange: (e) => setStatus(e.target.value),
              className: "w-full rounded-md border border-gray-300 dark:border-slate-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-700 dark:text-white",
              children: [
                /* @__PURE__ */ jsx("option", { value: "published", children: "Published" }),
                /* @__PURE__ */ jsx("option", { value: "draft", children: "Draft" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end space-x-4", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => window.history.back(),
              className: "px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-50 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600",
              disabled: saving,
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              className: "px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark",
              disabled: saving,
              children: saving ? "Saving..." : "Update Post"
            }
          )
        ] })
      ] }) })
    ] }) })
  ] });
}

const prerender = false;
const $$DirectEdit = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Direct Edit - ABlog", "description": "Edit your blog post directly" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-4xl mx-auto py-8"> <h1 class="text-3xl font-bold mb-8 dark:text-white">Direct Edit</h1> <p class="mb-4 text-gray-600 dark:text-gray-300">This is a simplified editor that directly accesses your posts.</p> ${renderComponent($$result2, "DirectEditForm", DirectEditForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/amogh/Documents/augment-projects/ABlog/src/components/DirectEditForm", "client:component-export": "default" })} </div> ` })}`;
}, "C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/direct-edit.astro", void 0);

const $$file = "C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/direct-edit.astro";
const $$url = "/direct-edit";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$DirectEdit,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
