import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useRef, useEffect } from 'react';

function RichTextEditor({ content, onChange }) {
  const [editorContent, setEditorContent] = useState(content || "");
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedTab, setSelectedTab] = useState("write");
  const [selectedText, setSelectedText] = useState("");
  const textareaRef = useRef(null);
  useEffect(() => {
    if (content !== editorContent) {
      setEditorContent(content);
    }
  }, [content]);
  const handleChange = (e) => {
    const newContent = e.target.value;
    setEditorContent(newContent);
    onChange(newContent);
  };
  const getSelectedText = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      return editorContent.substring(start, end);
    }
    return "";
  };
  const insertAtCursor = (textToInsert) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const text = editorContent;
      const newText = text.substring(0, start) + textToInsert + text.substring(end);
      setEditorContent(newText);
      onChange(newText);
      setTimeout(() => {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
      }, 0);
    }
  };
  const wrapSelectedText = (before, after) => {
    const selected = getSelectedText();
    if (selected) {
      insertAtCursor(before + selected + after);
    } else {
      insertAtCursor(before + "text" + after);
      if (textareaRef.current) {
        const start = textareaRef.current.selectionStart - after.length - 4;
        setTimeout(() => {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(start, start + 4);
        }, 0);
      }
    }
  };
  const handleBold = () => wrapSelectedText("**", "**");
  const handleItalic = () => wrapSelectedText("*", "*");
  const handleHeading = (level) => wrapSelectedText("\n" + "#".repeat(level) + " ", "");
  const handleLink = () => wrapSelectedText("[", "](https://example.com)");
  const handleList = (type) => {
    const selected = getSelectedText();
    if (selected) {
      const lines = selected.split("\n");
      const prefix = type === "ordered" ? (i) => `${i + 1}. ` : () => "- ";
      const newText = lines.map((line, i) => prefix(i) + line).join("\n");
      insertAtCursor(newText);
    } else {
      insertAtCursor(type === "ordered" ? "1. Item 1\n2. Item 2\n3. Item 3" : "- Item 1\n- Item 2\n- Item 3");
    }
  };
  const handleCode = () => wrapSelectedText("`", "`");
  const handleCodeBlock = () => wrapSelectedText("\n```\n", "\n```");
  const handleQuote = () => {
    const selected = getSelectedText();
    if (selected) {
      const lines = selected.split("\n");
      const newText = lines.map((line) => `> ${line}`).join("\n");
      insertAtCursor(newText);
    } else {
      insertAtCursor("\n> Important quote or highlighted text goes here\n");
    }
  };
  const handleHorizontalRule = () => insertAtCursor("\n\n---\n\n");
  const markdownToHtml = (markdown) => {
    if (!markdown) return "";
    let html = markdown;
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, src) => {
      console.log("Image found in markdown:", { alt, src });
      return `<div class="my-4" style="margin: 1.5rem 0;"><img src="${src}" alt="${alt || "Image"}" class="max-w-full h-auto rounded" style="max-height: 300px; display: block; max-width: 100%; border-radius: 0.375rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);"/></div>`;
    });
    html = html.replace(/<img\s+src="(data:image\/[^;]+;base64,[^"]+)"([^>]*)>/g, (match, src, attrs) => {
      return `<div class="my-4" style="margin: 1.5rem 0;"><img src="${src}" ${attrs} class="max-w-full h-auto rounded" style="max-height: 300px; display: block; max-width: 100%; border-radius: 0.375rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);"/></div>`;
    });
    html = html.replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold my-3">$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold my-3">$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold my-4">$1</h1>');
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
    html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" class="text-primary hover:underline">$1</a>');
    html = html.replace(/^- (.+)$/gm, '<li class="ml-6 list-disc">$1</li>');
    html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-6 list-decimal">$1</li>');
    html = html.replace(/(<li class="ml-6 list-disc">.+<\/li>\n?)+/g, '<ul class="my-4">$&</ul>');
    html = html.replace(/(<li class="ml-6 list-decimal">.+<\/li>\n?)+/g, '<ol class="my-4">$&</ol>');
    html = html.replace(/```([\s\S]+?)```/g, '<pre class="bg-gray-100 p-4 rounded-md my-4 overflow-x-auto"><code>$1</code></pre>');
    html = html.replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>');
    html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary pl-4 py-2 italic my-4 bg-primary-50 rounded-r">$1</blockquote>');
    html = html.replace(/^---$/gm, '<hr class="my-6 border-t border-gray-300">');
    html = html.replace(/(?<!\n)\n(?!\n)(?!<\/li>|<\/blockquote>|<\/h[1-6]>|<\/pre>|<\/code>|<\/div>)/g, "<br>");
    html = html.replace(/^(?!<[a-z]).+$/gm, '<p class="my-2">$&</p>');
    html = html.replace(/<p class="my-2">/g, '<p class="my-2" style="margin: 0.5rem 0; line-height: 1.5;">');
    html = html.replace(/\n\n+/g, '</p>\n\n<p class="my-2" style="margin: 0.5rem 0; line-height: 1.5;">');
    html = html.replace(/\n(?!<)/g, "<br>");
    return html;
  };
  return /* @__PURE__ */ jsxs("div", { className: "border border-gray-600 rounded-md overflow-hidden bg-gray-800", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-700 p-2 border-b border-gray-600 text-white", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex mb-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setSelectedTab("write"),
            className: `px-4 py-1 rounded-md ${selectedTab === "write" ? "bg-gray-800 shadow-sm text-white" : "hover:bg-gray-600 text-gray-200"}`,
            children: "Write"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setSelectedTab("preview"),
            className: `px-4 py-1 ml-2 rounded-md ${selectedTab === "preview" ? "bg-gray-800 shadow-sm text-white" : "hover:bg-gray-600 text-gray-200"}`,
            children: "Preview"
          }
        )
      ] }),
      selectedTab === "write" && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-1", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: handleBold,
            className: "p-1 hover:bg-gray-600 rounded text-white",
            title: "Bold (Ctrl+B)",
            children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 12h8a4 4 0 100-8H6v8zm0 0h8a4 4 0 110 8H6v-8z" }) })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: handleItalic,
            className: "p-1 hover:bg-gray-600 rounded text-white",
            title: "Italic (Ctrl+I)",
            children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" }) })
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "h-5 border-l border-gray-500 mx-1" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => handleHeading(1),
            className: "p-1 hover:bg-gray-600 rounded text-white",
            title: "Heading 1",
            children: /* @__PURE__ */ jsx("span", { className: "font-bold", children: "H1" })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => handleHeading(2),
            className: "p-1 hover:bg-gray-600 rounded text-white",
            title: "Heading 2",
            children: /* @__PURE__ */ jsx("span", { className: "font-bold", children: "H2" })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => handleHeading(3),
            className: "p-1 hover:bg-gray-600 rounded text-white",
            title: "Heading 3",
            children: /* @__PURE__ */ jsx("span", { className: "font-bold", children: "H3" })
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "h-5 border-l border-gray-500 mx-1" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => handleList("unordered"),
            className: "p-1 hover:bg-gray-600 rounded text-white",
            title: "Bullet List",
            children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 6h16M4 12h16M4 18h16" }) })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => handleList("ordered"),
            className: "p-1 hover:bg-gray-600 rounded text-white",
            title: "Numbered List",
            children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M7 8h10M7 12h10M7 16h10M3 8h.01M3 12h.01M3 16h.01" }) })
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "h-5 border-l border-gray-500 mx-1" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: handleLink,
            className: "p-1 hover:bg-gray-600 rounded text-white",
            title: "Insert Link",
            children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" }) })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: handleQuote,
            className: "p-1 hover:bg-gray-600 rounded text-white",
            title: "Blockquote",
            children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" }) })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: handleCode,
            className: "p-1 hover:bg-gray-600 rounded text-white",
            title: "Inline Code",
            children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" }) })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: handleCodeBlock,
            className: "p-1 hover:bg-gray-600 rounded text-white",
            title: "Code Block",
            children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" }) })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: handleHorizontalRule,
            className: "p-1 hover:bg-gray-600 rounded text-white",
            title: "Horizontal Rule",
            children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 12h16" }) })
          }
        )
      ] })
    ] }),
    selectedTab === "write" ? /* @__PURE__ */ jsx(
      "textarea",
      {
        ref: textareaRef,
        className: "w-full min-h-[400px] p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono bg-gray-800 text-white border-0",
        value: editorContent,
        onChange: handleChange,
        placeholder: "Write your content here using Markdown..."
      }
    ) : /* @__PURE__ */ jsxs("div", { className: "w-full min-h-[400px] p-4 prose max-w-none overflow-auto bg-gray-800 text-white", style: { lineHeight: 1.5 }, children: [
      /* @__PURE__ */ jsx("style", { children: `
              /* Ensure images display properly in the preview */
              /* Image styles removed */

              /* Ensure code blocks display properly */
              .preview-content pre {
                background-color: #f3f4f6 !important;
                padding: 1rem !important;
                border-radius: 0.375rem !important;
                overflow-x: auto !important;
                margin: 1rem 0 !important;
              }

              /* Ensure blockquotes display properly */
              .preview-content blockquote {
                border-left: 4px solid #d1d5db !important;
                padding-left: 1rem !important;
                padding-top: 0.25rem !important;
                padding-bottom: 0.25rem !important;
                font-style: italic !important;
                margin: 0.75rem 0 !important;
              }

              /* Ensure lists display properly */
              .preview-content ul,
              .preview-content ol {
                margin: 1rem 0 !important;
                padding-left: 1.5rem !important;
              }

              .preview-content ul li {
                list-style-type: disc !important;
                margin: 0.25rem 0 !important;
              }

              .preview-content ol li {
                list-style-type: decimal !important;
                margin: 0.25rem 0 !important;
              }

              /* Ensure headings display properly */
              .preview-content h1 {
                font-size: 1.875rem !important;
                font-weight: 700 !important;
                margin: 1.5rem 0 1rem !important;
              }

              .preview-content h2 {
                font-size: 1.5rem !important;
                font-weight: 700 !important;
                margin: 1.25rem 0 0.75rem !important;
              }

              .preview-content h3 {
                font-size: 1.25rem !important;
                font-weight: 700 !important;
                margin: 1rem 0 0.5rem !important;
              }

              /* Ensure paragraphs display properly */
              .preview-content p {
                margin: 0.25rem 0 !important;
                line-height: 1.4 !important;
              }

              /* Ensure links display properly */
              .preview-content a {
                color: #3b82f6 !important;
                text-decoration: none !important;
              }

              .preview-content a:hover {
                text-decoration: underline !important;
              }

              /* Ensure horizontal rules display properly */
              .preview-content hr {
                margin: 1.5rem 0 !important;
                border: 0 !important;
                border-top: 1px solid #d1d5db !important;
              }
            ` }),
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "preview-content",
          dangerouslySetInnerHTML: { __html: markdownToHtml(editorContent) }
        }
      ),
      editorContent.includes("![") && /* @__PURE__ */ jsx("div", { className: "mt-4 p-2 bg-blue-50 text-blue-700 rounded-md text-sm", children: /* @__PURE__ */ jsxs("p", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Note:" }),
        " Images are displayed in the preview. If you don't see an image, check that the URL is correct and accessible."
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-gray-700 p-2 border-t border-gray-600 text-xs text-gray-300", children: /* @__PURE__ */ jsxs("p", { children: [
      "Use Markdown for formatting. ",
      /* @__PURE__ */ jsx("a", { href: "https://www.markdownguide.org/cheat-sheet/", target: "_blank", rel: "noopener noreferrer", className: "text-primary hover:underline", children: "Markdown Cheat Sheet" })
    ] }) })
  ] });
}

function ImageUploader({ onImageSelect, buttonText = "Upload Image", initialImage = null }) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(initialImage);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  useEffect(() => {
    if (initialImage) {
      setPreview(initialImage);
      if (onImageSelect) {
        onImageSelect(initialImage);
      }
    }
  }, [initialImage]);
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };
  const handleFile = (file) => {
    setError("");
    if (!file.type.match("image.*")) {
      setError("Please select an image file (PNG, JPG, JPEG, GIF)");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image size should be less than 2MB for better compatibility");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target.result;
      setPreview(imageData);
      optimizeImage(imageData, file.type, (optimizedImage) => {
        if (onImageSelect) {
          onImageSelect(optimizedImage);
        }
      });
    };
    reader.readAsDataURL(file);
  };
  const optimizeImage = (src, fileType, callback) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 900;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        width = Math.floor(width);
        height = Math.floor(height);
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        let quality = 0.8;
        if (width * height > 1e6) {
          quality = 0.7;
        }
        if (width * height > 2e6) {
          quality = 0.6;
        }
        const optimizedDataUrl = canvas.toDataURL(fileType, quality);
        console.log(
          "Image optimized successfully. Original size vs optimized:",
          Math.round(src.length / 1024),
          "KB vs",
          Math.round(optimizedDataUrl.length / 1024),
          "KB"
        );
        if (optimizedDataUrl.length > 1.5 * 1024 * 1024) {
          console.warn("Image still large after optimization. Trying with lower quality...");
          const lowerQualityDataUrl = canvas.toDataURL(fileType, 0.5);
          if (lowerQualityDataUrl.length > 1.5 * 1024 * 1024) {
            console.warn("Image still too large even with lower quality.");
            setError("Image is too large for storage. Please use a smaller image.");
          } else {
            console.log("Successfully optimized large image with lower quality");
            callback(lowerQualityDataUrl);
            return;
          }
        }
        callback(optimizedDataUrl);
      } catch (err) {
        console.error("Error during image optimization:", err);
        setError("Error processing image. Please try another image.");
        callback("/images/placeholder-cover.svg");
      }
    };
    img.onerror = () => {
      console.error("Error loading image for optimization");
      setError("Error loading image. Please try another image.");
      callback("/images/placeholder-cover.svg");
    };
    img.src = src;
  };
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };
  const handleRemoveImage = () => {
    setPreview(null);
    if (onImageSelect) {
      onImageSelect(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
    !preview ? /* @__PURE__ */ jsxs(
      "div",
      {
        className: `border-2 border-dashed rounded-lg p-6 text-center ${dragActive ? "border-purple-500 bg-purple-900/10" : "border-gray-300 dark:border-gray-700"} dark:bg-gray-900`,
        onDragEnter: handleDrag,
        onDragLeave: handleDrag,
        onDragOver: handleDrag,
        onDrop: handleDrop,
        children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              ref: fileInputRef,
              type: "file",
              accept: "image/*",
              onChange: handleChange,
              className: "hidden"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center", children: [
            /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-12 w-12 text-gray-400 dark:text-gray-500 mb-3", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" }) }),
            /* @__PURE__ */ jsxs("p", { className: "mb-2 text-sm text-gray-500 dark:text-gray-400", children: [
              /* @__PURE__ */ jsx("span", { className: "font-semibold dark:text-purple-300", children: "Click to upload" }),
              " or drag and drop"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-500", children: "PNG, JPG, JPEG or GIF (MAX. 2MB)" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: handleButtonClick,
                className: "mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors",
                children: buttonText
              }
            )
          ] })
        ]
      }
    ) : /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: preview,
          alt: "Preview",
          className: "w-full h-auto rounded-lg",
          onError: (e) => {
            console.error("Error loading preview image");
            e.target.onerror = null;
            e.target.src = "/images/placeholder-cover.svg";
            setError("Error displaying image preview. The image may be corrupted.");
          }
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "absolute top-2 right-2 flex space-x-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: handleButtonClick,
            className: "p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700",
            title: "Change image",
            children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 text-gray-600 dark:text-gray-300", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" }) })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: handleRemoveImage,
            className: "p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700",
            title: "Remove image",
            children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 text-red-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) })
          }
        )
      ] })
    ] }),
    error && /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-red-500", children: error })
  ] });
}

export { ImageUploader as I, RichTextEditor as R };
