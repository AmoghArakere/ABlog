/* empty css                                 */
import { e as createComponent, i as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_9nBo-_fU.mjs';
import 'kleur/colors';
import 'html-escaper';
import { a as authService, $ as $$Layout } from '../chunks/Layout_2Bm93tX_.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { b as blogService } from '../chunks/localStorageService_BSOMlJt7.mjs';
import { I as ImageUploader, R as RichTextEditor } from '../chunks/ImageUploader_Okv_sFRG.mjs';
export { renderers } from '../renderers.mjs';

function SimpleEditForm() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState("published");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get("id");
    if (postId) {
      setSelectedPostId(postId);
    }
  }, []);
  useEffect(() => {
    const loadUserAndPosts = async () => {
      try {
        setLoading(true);
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        if (!currentUser) {
          setError("You must be logged in to edit posts");
          setLoading(false);
          return;
        }
        const result = await blogService.getAllPosts();
        const userPosts = result.posts.filter((post) => post.author_id === currentUser.id);
        setPosts(userPosts);
        setLoading(false);
      } catch (err) {
        console.error("Error loading user and posts:", err);
        setError("Failed to load your posts");
        setLoading(false);
      }
    };
    loadUserAndPosts();
  }, []);
  useEffect(() => {
    if (selectedPostId && posts.length > 0) {
      const post = posts.find((p) => p.id === selectedPostId);
      if (post) {
        setEditingPost(post);
        setTitle(post.title || "");
        setContent(post.content || "");
        setCoverImage(post.cover_image || "");
        setStatus(post.status || "published");
      } else {
        setError("Post not found");
      }
    }
  }, [selectedPostId, posts]);
  const handleSelectPost = (postId) => {
    setSelectedPostId(postId);
    setError("");
    setMessage("");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingPost) {
      setError("No post selected for editing");
      return;
    }
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!content.trim()) {
      setError("Content is required");
      return;
    }
    try {
      setSaving(true);
      setError("");
      setMessage("");
      const result = await blogService.updatePost(editingPost.id, {
        title,
        content,
        excerpt: title.substring(0, 150) + "...",
        cover_image: coverImage,
        status,
        categories: editingPost.categories ? editingPost.categories.map((c) => c.id) : [],
        tags: editingPost.tags ? editingPost.tags.map((t) => t.id) : []
      });
      if (result.success) {
        setMessage("Post updated successfully!");
        const updatedResult = await blogService.getAllPosts();
        const userPosts = updatedResult.posts.filter((post) => post.author_id === user.id);
        setPosts(userPosts);
        const updatedPost = userPosts.find((p) => p.id === editingPost.id);
        if (updatedPost) {
          setEditingPost(updatedPost);
        }
      } else {
        setError(result.error || "Failed to update post");
      }
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
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-gray-600", children: "Loading your posts..." })
    ] });
  }
  if (!user) {
    return /* @__PURE__ */ jsxs("div", { className: "bg-yellow-50 text-yellow-700 p-6 rounded-lg", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xl font-semibold", children: "You need to be logged in to edit posts" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2", children: "Please log in to continue." }),
      /* @__PURE__ */ jsx("a", { href: "/login", className: "mt-4 inline-block px-4 py-2 bg-primary text-white rounded-md", children: "Log In" })
    ] });
  }
  if (posts.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 text-blue-700 p-6 rounded-lg", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xl font-semibold", children: "You don't have any posts yet" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2", children: "Create your first post to get started." }),
      /* @__PURE__ */ jsx("a", { href: "/create-post", className: "mt-4 inline-block px-4 py-2 bg-primary text-white rounded-md", children: "Create Post" })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [
    /* @__PURE__ */ jsx("div", { className: "md:col-span-1", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow p-4", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold mb-4", children: "Your Posts" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-2", children: posts.map((post) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: `p-3 rounded-md cursor-pointer transition-colors ${selectedPostId === post.id ? "bg-primary text-white" : "bg-gray-100 hover:bg-gray-200"}`,
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
    /* @__PURE__ */ jsx("div", { className: "md:col-span-2", children: !editingPost ? /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg shadow p-6 text-center", children: /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "Select a post from the list to edit" }) }) : /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold mb-6", children: "Edit Post" }),
      error && /* @__PURE__ */ jsx("div", { className: "bg-red-50 text-red-600 p-4 rounded-md mb-4", children: error }),
      message && /* @__PURE__ */ jsx("div", { className: "bg-green-50 text-green-600 p-4 rounded-md mb-4", children: message }),
      /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "title", className: "block text-sm font-medium mb-2", children: "Title" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "title",
              type: "text",
              value: title,
              onChange: (e) => setTitle(e.target.value),
              className: "w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "coverImage", className: "block text-sm font-medium mb-2", children: "Cover Image" }),
          /* @__PURE__ */ jsx(
            ImageUploader,
            {
              onImageSelect: setCoverImage,
              buttonText: "Upload Cover Image",
              initialImage: coverImage
            }
          ),
          coverImage && /* @__PURE__ */ jsx("div", { className: "mt-4 border rounded-md overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "relative h-48 bg-gray-100", children: /* @__PURE__ */ jsx(
            "img",
            {
              src: coverImage,
              alt: "Cover preview",
              className: "h-full w-full object-cover",
              onError: (e) => {
                e.target.style.display = "none";
              }
            }
          ) }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "content", className: "block text-sm font-medium mb-2", children: "Content" }),
          /* @__PURE__ */ jsx(RichTextEditor, { content, onChange: setContent })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "status", className: "block text-sm font-medium mb-2", children: "Status" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "status",
              value: status,
              onChange: (e) => setStatus(e.target.value),
              className: "w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
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
              className: "px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50",
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
const $$SimpleEdit = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Edit Post - ABlog", "description": "Edit your blog post" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-4xl mx-auto py-8"> <h1 class="text-3xl font-bold mb-8">Edit Post</h1> ${renderComponent($$result2, "SimpleEditForm", SimpleEditForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/amogh/Documents/augment-projects/ABlog/src/components/SimpleEditForm", "client:component-export": "default" })} </div> ` })}`;
}, "C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/simple-edit.astro", void 0);

const $$file = "C:/Users/amogh/Documents/augment-projects/ABlog/src/pages/simple-edit.astro";
const $$url = "/simple-edit";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$SimpleEdit,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
