import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import React, { useState, useEffect } from 'react';
import { b as blogService } from './localStorageService_BSOMlJt7.mjs';
import { c as cn, a as authService, B as Button } from './Layout_2Bm93tX_.mjs';
import { I as ImageUploader, R as RichTextEditor } from './ImageUploader_Okv_sFRG.mjs';
import { cva } from 'class-variance-authority';

const Card = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: cn(
      "rounded-lg border border-gray-800 bg-black text-white shadow-md",
      className
    ),
    ...props
  }
));
Card.displayName = "Card";
const CardHeader = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: cn("flex flex-col space-y-1.5 p-6", className),
    ...props
  }
));
CardHeader.displayName = "CardHeader";
const CardTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "h3",
  {
    ref,
    className: cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    ),
    ...props
  }
));
CardTitle.displayName = "CardTitle";
const CardDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "p",
  {
    ref,
    className: cn("text-sm text-gray-400", className),
    ...props
  }
));
CardDescription.displayName = "CardDescription";
const CardContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", { ref, className: cn("p-6 pt-0", className), ...props }));
CardContent.displayName = "CardContent";
const CardFooter = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: cn("flex items-center p-6 pt-0", className),
    ...props
  }
));
CardFooter.displayName = "CardFooter";

const Input = React.forwardRef(({ className, type = "text", ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    "input",
    {
      type,
      className: cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ref,
      ...props
    }
  );
});
Input.displayName = "Input";

const Label = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    "label",
    {
      className: cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      ),
      ref,
      ...props
    }
  );
});
Label.displayName = "Label";

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    "textarea",
    {
      className: cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ref,
      ...props
    }
  );
});
Textarea.displayName = "Textarea";

const Select = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    "select",
    {
      className: cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ref,
      ...props
    }
  );
});
Select.displayName = "Select";

const Checkbox = React.forwardRef(({ className, checked, onCheckedChange, ...props }, ref) => {
  return /* @__PURE__ */ jsx("div", { className: "flex items-center space-x-2", children: /* @__PURE__ */ jsx(
    "input",
    {
      type: "checkbox",
      ref,
      checked,
      onChange: (e) => onCheckedChange && onCheckedChange(e.target.checked),
      className: cn(
        "h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary",
        className
      ),
      ...props
    }
  ) });
});
Checkbox.displayName = "Checkbox";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-danger/50 text-danger dark:border-danger [&>svg]:text-danger",
        success: "border-success/50 text-success dark:border-success [&>svg]:text-success",
        warning: "border-warning/50 text-warning dark:border-warning [&>svg]:text-warning"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
const Alert = React.forwardRef(({ className, variant, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    role: "alert",
    className: cn(alertVariants({ variant }), className),
    ...props
  }
));
Alert.displayName = "Alert";
const AlertTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "h5",
  {
    ref,
    className: cn("mb-1 font-medium leading-none tracking-tight", className),
    ...props
  }
));
AlertTitle.displayName = "AlertTitle";
const AlertDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: cn("text-sm [&_p]:leading-relaxed", className),
    ...props
  }
));
AlertDescription.displayName = "AlertDescription";

function ClientEditPostForm({ slug, post: initialPost }) {
  const [post, setPost] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState("published");
  const [scheduledDate, setScheduledDate] = useState("");
  const [showScheduleOptions, setShowScheduleOptions] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState(null);
  const [isAuthor, setIsAuthor] = useState(false);
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    console.log("Current user:", currentUser);
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.log("Loading timeout reached");
        setLoading(false);
        setError("Loading timed out. Please try again later.");
      }
    }, 1e4);
    const fetchData = async () => {
      try {
        setLoading(true);
        if (initialPost) {
          console.log("Using provided post data:", initialPost.id);
          setPost(initialPost);
          if (currentUser && initialPost.author_id === currentUser.id) {
            console.log("User is the author of the post");
            setIsAuthor(true);
          } else {
            console.error("User is not authorized to edit this post");
            setError("You are not authorized to edit this post");
            setLoading(false);
            return;
          }
          setTitle(initialPost.title || "");
          setContent(initialPost.content || "");
          setExcerpt(initialPost.excerpt || "");
          setCoverImage(initialPost.cover_image || "");
          setStatus(initialPost.status || "published");
          if (initialPost.scheduled_publish_date) {
            setScheduledDate(initialPost.scheduled_publish_date.slice(0, 16));
            if (initialPost.status === "scheduled") {
              setShowScheduleOptions(true);
            }
          }
          if (initialPost.categories) {
            setSelectedCategories(initialPost.categories.map((cat) => cat.id));
          }
          if (initialPost.tags) {
            setSelectedTags(initialPost.tags.map((tag) => tag.id));
          }
          const allCategories2 = await categoryService.getAllCategories();
          const allTags2 = await tagService.getAllTags();
          setCategories(allCategories2);
          setTags(allTags2);
          setLoading(false);
          return;
        }
        console.log("Fetching post with slug:", slug);
        if (!slug) {
          console.error("No slug provided to edit form");
          setError("No post identifier provided");
          setLoading(false);
          return;
        }
        const postData = await blogService.getPostBySlug(slug);
        console.log("Post data received:", postData);
        if (!postData) {
          console.error("Post not found for slug:", slug);
          setError("Post not found");
          setLoading(false);
          return;
        }
        setPost(postData);
        if (currentUser && postData.author_id === currentUser.id) {
          console.log("User is the author of the post");
          setIsAuthor(true);
        } else {
          console.error("User is not authorized to edit this post");
          setError("You are not authorized to edit this post");
          setLoading(false);
          return;
        }
        setTitle(postData.title || "");
        setContent(postData.content || "");
        setExcerpt(postData.excerpt || "");
        setCoverImage(postData.cover_image || "");
        setStatus(postData.status || "published");
        if (postData.scheduled_publish_date) {
          setScheduledDate(postData.scheduled_publish_date.slice(0, 16));
          if (postData.status === "scheduled") {
            setShowScheduleOptions(true);
          }
        }
        if (postData.categories) {
          setSelectedCategories(postData.categories.map((cat) => cat.id));
        }
        if (postData.tags) {
          setSelectedTags(postData.tags.map((tag) => tag.id));
        }
        const allCategories = await categoryService.getAllCategories();
        const allTags = await tagService.getAllTags();
        setCategories(allCategories);
        setTags(allTags);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching post data:", err);
        setError("Failed to load post data");
        setLoading(false);
      }
    };
    fetchData();
    return () => {
      clearTimeout(loadingTimeout);
    };
  }, [slug, initialPost, loading]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    if (!title.trim()) {
      setError("Title is required");
      setSaving(false);
      return;
    }
    if (!content.trim()) {
      setError("Content is required");
      setSaving(false);
      return;
    }
    if (coverImage) {
      console.log("Cover image data length:", coverImage.length);
      if (typeof coverImage === "string" && coverImage.startsWith("data:image/")) ; else if (typeof coverImage === "string" && (coverImage.startsWith("http://") || coverImage.startsWith("https://"))) ; else if (!coverImage) ; else {
        setError("Invalid cover image format");
        setSaving(false);
        return;
      }
    }
    try {
      const result = await blogService.updatePost(post.id, {
        title,
        content,
        excerpt: excerpt || title.substring(0, 150) + "...",
        cover_image: coverImage,
        status,
        scheduled_publish_date: status === "scheduled" ? scheduledDate : null,
        categories: selectedCategories,
        tags: selectedTags
      });
      if (result.success) {
        setSuccess("Post updated successfully!");
        setTimeout(() => {
          window.location.href = `/blogs/${result.post.slug}`;
        }, 1500);
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
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const result = await categoryService.createCategory({
        name: newCategory.trim()
      });
      if (result.success) {
        setCategories([...categories, result.category]);
        setSelectedCategories([...selectedCategories, result.category.id]);
        setNewCategory("");
      }
    } catch (err) {
      console.error("Error adding category:", err);
    }
  };
  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    try {
      const result = await tagService.createTag({
        name: newTag.trim()
      });
      if (result.success) {
        setTags([...tags, result.tag]);
        setSelectedTags([...selectedTags, result.tag.id]);
        setNewTag("");
      }
    } catch (err) {
      console.error("Error adding tag:", err);
    }
  };
  const handleCategoryChange = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };
  const handleTagChange = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter((id) => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-text-muted", children: "Loading post data..." }),
      /* @__PURE__ */ jsxs("p", { className: "mt-2 text-sm text-gray-500", children: [
        "If loading takes too long, the post may not exist or you may not have permission to edit it.",
        /* @__PURE__ */ jsx("br", {}),
        /* @__PURE__ */ jsx("a", { href: "/blogs", className: "text-primary hover:underline", children: "Return to all posts" })
      ] })
    ] });
  }
  if (error && !isAuthor) {
    return /* @__PURE__ */ jsx("div", { className: "text-center py-12", children: /* @__PURE__ */ jsxs("div", { className: "bg-red-50 text-red-500 p-6 rounded-lg inline-block", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xl font-semibold", children: error }),
      /* @__PURE__ */ jsx("p", { className: "mt-2", children: "You need to be the author of this post to edit it." }),
      /* @__PURE__ */ jsx("a", { href: "/blogs", className: "mt-4 inline-block px-4 py-2 bg-primary text-white rounded-md", children: "Browse All Posts" })
    ] }) });
  }
  return /* @__PURE__ */ jsxs(Card, { className: "p-6", children: [
    error && /* @__PURE__ */ jsx(Alert, { variant: "destructive", className: "mb-6", children: error }),
    success && /* @__PURE__ */ jsx(Alert, { variant: "success", className: "mb-6", children: success }),
    /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "title", className: "block text-sm font-medium mb-2", children: "Title" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "title",
            type: "text",
            value: title,
            onChange: (e) => setTitle(e.target.value),
            placeholder: "Enter post title",
            className: "w-full",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "excerpt", className: "block text-sm font-medium mb-2", children: "Excerpt (optional)" }),
        /* @__PURE__ */ jsx(
          Textarea,
          {
            id: "excerpt",
            value: excerpt,
            onChange: (e) => setExcerpt(e.target.value),
            placeholder: "Brief description of your post",
            className: "w-full h-24"
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-text-muted mt-1", children: "If left empty, the first 150 characters of your post will be used." })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "coverImage", className: "block text-sm font-medium mb-2", children: "Cover Image" }),
        /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx(
          ImageUploader,
          {
            onImageSelect: (imageData) => {
              console.log("Image selected, data length:", imageData ? imageData.length : 0);
              setCoverImage(imageData);
            },
            buttonText: "Upload Cover Image",
            initialImage: coverImage
          }
        ) }),
        coverImage && /* @__PURE__ */ jsxs("div", { className: "mt-4 border rounded-md overflow-hidden", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium px-4 py-2 bg-gray-50 border-b", children: "Image Preview" }),
          /* @__PURE__ */ jsx("div", { className: "relative h-48 bg-gray-100", children: /* @__PURE__ */ jsx(
            "img",
            {
              src: coverImage,
              alt: "Cover preview",
              className: "h-full w-full object-cover",
              onError: (e) => {
                console.error("Error loading cover image preview");
                e.target.style.display = "none";
              }
            }
          ) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "content", className: "block text-sm font-medium mb-2", children: "Content" }),
        /* @__PURE__ */ jsx(RichTextEditor, { content, onChange: setContent })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { className: "block text-sm font-medium mb-2", children: "Categories" }),
          /* @__PURE__ */ jsx("div", { className: "space-y-2 mb-4", children: categories.map((category) => /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
            /* @__PURE__ */ jsx(
              Checkbox,
              {
                id: `category-${category.id}`,
                checked: selectedCategories.includes(category.id),
                onCheckedChange: () => handleCategoryChange(category.id)
              }
            ),
            /* @__PURE__ */ jsx("label", { htmlFor: `category-${category.id}`, className: "ml-2 text-sm", children: category.name })
          ] }, category.id)) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsx(
              Input,
              {
                type: "text",
                value: newCategory,
                onChange: (e) => setNewCategory(e.target.value),
                placeholder: "Add new category",
                className: "flex-1"
              }
            ),
            /* @__PURE__ */ jsx(Button, { type: "button", onClick: handleAddCategory, variant: "outline", children: "Add" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { className: "block text-sm font-medium mb-2", children: "Tags" }),
          /* @__PURE__ */ jsx("div", { className: "space-y-2 mb-4", children: tags.map((tag) => /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
            /* @__PURE__ */ jsx(
              Checkbox,
              {
                id: `tag-${tag.id}`,
                checked: selectedTags.includes(tag.id),
                onCheckedChange: () => handleTagChange(tag.id)
              }
            ),
            /* @__PURE__ */ jsx("label", { htmlFor: `tag-${tag.id}`, className: "ml-2 text-sm", children: tag.name })
          ] }, tag.id)) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsx(
              Input,
              {
                type: "text",
                value: newTag,
                onChange: (e) => setNewTag(e.target.value),
                placeholder: "Add new tag",
                className: "flex-1"
              }
            ),
            /* @__PURE__ */ jsx(Button, { type: "button", onClick: handleAddTag, variant: "outline", children: "Add" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "status", className: "block text-sm font-medium mb-2", children: "Status" }),
        /* @__PURE__ */ jsxs(
          Select,
          {
            id: "status",
            value: status,
            onChange: (e) => {
              const newStatus = e.target.value;
              setStatus(newStatus);
              if (newStatus === "scheduled") {
                setShowScheduleOptions(true);
                if (!scheduledDate) {
                  const defaultTime = /* @__PURE__ */ new Date();
                  defaultTime.setHours(defaultTime.getHours() + 1);
                  setScheduledDate(defaultTime.toISOString().slice(0, 16));
                }
              } else {
                setShowScheduleOptions(false);
              }
            },
            className: "w-full",
            children: [
              /* @__PURE__ */ jsx("option", { value: "published", children: "Published" }),
              /* @__PURE__ */ jsx("option", { value: "draft", children: "Draft" }),
              /* @__PURE__ */ jsx("option", { value: "scheduled", children: "Scheduled" })
            ]
          }
        )
      ] }),
      showScheduleOptions && /* @__PURE__ */ jsxs("div", { className: "bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4 mb-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium mb-3", children: "Schedule Publication" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "scheduledDate", className: "block text-sm font-medium mb-2", children: "Publication Date and Time" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                type: "datetime-local",
                id: "scheduledDate",
                value: scheduledDate,
                min: (() => {
                  const now = /* @__PURE__ */ new Date();
                  now.setMinutes(now.getMinutes() + 5);
                  return now.toISOString().slice(0, 16);
                })(),
                onChange: (e) => setScheduledDate(e.target.value),
                className: "w-full",
                required: status === "scheduled"
              }
            )
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Your post will be automatically published at the scheduled time." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end space-x-4", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "button",
            variant: "outline",
            onClick: () => window.history.back(),
            disabled: saving,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "submit",
            disabled: saving,
            children: saving ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { className: "animate-spin mr-2", children: "⟳" }),
              "Saving..."
            ] }) : "Update Post"
          }
        )
      ] })
    ] }) })
  ] });
}

export { ClientEditPostForm as C, Card as a };
