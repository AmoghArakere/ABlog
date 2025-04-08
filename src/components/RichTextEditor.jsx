import React, { useState, useEffect, useRef } from 'react';

export default function RichTextEditor({ content, onChange }) {
  const [editorContent, setEditorContent] = useState(content || '');
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedTab, setSelectedTab] = useState('write');
  const [selectedText, setSelectedText] = useState('');
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
    return '';
  };

  const insertAtCursor = (textToInsert) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const text = editorContent;
      const newText = text.substring(0, start) + textToInsert + text.substring(end);
      setEditorContent(newText);
      onChange(newText);

      // Set cursor position after the inserted text
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
      insertAtCursor(before + 'text' + after);
      // Select the default text for easy replacement
      if (textareaRef.current) {
        const start = textareaRef.current.selectionStart - after.length - 4;
        setTimeout(() => {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(start, start + 4);
        }, 0);
      }
    }
  };

  const handleBold = () => wrapSelectedText('**', '**');
  const handleItalic = () => wrapSelectedText('*', '*');
  const handleHeading = (level) => wrapSelectedText('\n' + '#'.repeat(level) + ' ', '');
  const handleLink = () => wrapSelectedText('[', '](https://example.com)');
  const handleList = (type) => {
    const selected = getSelectedText();
    if (selected) {
      const lines = selected.split('\n');
      const prefix = type === 'ordered' ? (i) => `${i + 1}. ` : () => '- ';
      const newText = lines.map((line, i) => prefix(i) + line).join('\n');
      insertAtCursor(newText);
    } else {
      insertAtCursor(type === 'ordered' ? '1. Item 1\n2. Item 2\n3. Item 3' : '- Item 1\n- Item 2\n- Item 3');
    }
  };

  const handleCode = () => wrapSelectedText('`', '`');
  const handleCodeBlock = () => wrapSelectedText('\n```\n', '\n```');

  const handleImage = () => {
    // Create a Cloudinary widget for image upload
    if (typeof window !== 'undefined' && window.cloudinary) {
      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'dvrnheiru',
          uploadPreset: import.meta.env.PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ablog_upload',
          sources: ['local', 'url', 'camera'],
          multiple: false,
          folder: 'ablog/posts',
          maxFileSize: 5000000, // 5MB
          debug: true,
          styles: {
            palette: {
              window: "#000000",
              sourceBg: "#222222",
              windowBorder: "#555555",
              tabIcon: "#FFFFFF",
              inactiveTabIcon: "#AAAAAA",
              menuIcons: "#CCCCCC",
              link: "#8A46F0",
              action: "#8A46F0",
              inProgress: "#8A46F0",
              complete: "#33ff00",
              error: "#EA2727",
              textDark: "#000000",
              textLight: "#FFFFFF"
            }
          }
        },
        (error, result) => {
          if (!error && result && result.event === "success") {
            const imageUrl = result.info.secure_url;
            const imageAlt = result.info.original_filename || 'Image';
            insertAtCursor(`![${imageAlt}](${imageUrl})`);
          }
        }
      );
      widget.open();
    } else {
      // Fallback for when Cloudinary is not available
      const imageUrl = prompt('Enter image URL:');
      if (imageUrl) {
        insertAtCursor(`![Image](${imageUrl})`);
      }
    }
  }

  const handleQuote = () => {
    const selected = getSelectedText();
    if (selected) {
      const lines = selected.split('\n');
      const newText = lines.map(line => `> ${line}`).join('\n');
      insertAtCursor(newText);
    } else {
      // Add a more descriptive placeholder for blockquotes
      insertAtCursor('\n> Important quote or highlighted text goes here\n');
    }
  };

  const handleHorizontalRule = () => insertAtCursor('\n\n---\n\n');

  // Enhanced markdown to HTML converter for preview
  const markdownToHtml = (markdown) => {
    if (!markdown) return '';

    let html = markdown;

    // Handle images first to prevent other rules from interfering
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, src) => {
      console.log('Image found in markdown:', { alt, src });
      return `<div class="my-4" style="margin: 1.5rem 0;"><img src="${src}" alt="${alt || 'Image'}" class="max-w-full h-auto rounded" style="max-height: 300px; display: block; max-width: 100%; border-radius: 0.375rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);"/></div>`;
    });

    // Also handle base64 images that might be in the content directly
    html = html.replace(/<img\s+src="(data:image\/[^;]+;base64,[^"]+)"([^>]*)>/g, (match, src, attrs) => {
      return `<div class="my-4" style="margin: 1.5rem 0;"><img src="${src}" ${attrs} class="max-w-full h-auto rounded" style="max-height: 300px; display: block; max-width: 100%; border-radius: 0.375rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);"/></div>`;
    });

    // Convert headers
    html = html.replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold my-3">$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold my-3">$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold my-4">$1</h1>');

    // Convert bold and italic
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Convert links
    html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" class="text-primary hover:underline">$1</a>');

    // Convert lists
    html = html.replace(/^- (.+)$/gm, '<li class="ml-6 list-disc">$1</li>');
    html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-6 list-decimal">$1</li>');
    html = html.replace(/(<li class="ml-6 list-disc">.+<\/li>\n?)+/g, '<ul class="my-4">$&</ul>');
    html = html.replace(/(<li class="ml-6 list-decimal">.+<\/li>\n?)+/g, '<ol class="my-4">$&</ol>');

    // Convert code blocks
    html = html.replace(/```([\s\S]+?)```/g, '<pre class="bg-gray-100 p-4 rounded-md my-4 overflow-x-auto"><code>$1</code></pre>');

    // Convert inline code
    html = html.replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>');

    // Convert blockquotes
    html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary pl-4 py-2 italic my-4 bg-primary-50 rounded-r">$1</blockquote>');

    // Convert horizontal rules
    html = html.replace(/^---$/gm, '<hr class="my-6 border-t border-gray-300">');

    // Preserve line breaks - convert single line breaks to <br> tags
    // But don't convert line breaks that are already part of HTML tags
    html = html.replace(/(?<!\n)\n(?!\n)(?!<\/li>|<\/blockquote>|<\/h[1-6]>|<\/pre>|<\/code>|<\/div>)/g, '<br>');

    // Convert paragraphs (but not if it's already a tag)
    // Use a more specific regex to avoid converting lines that are already HTML tags
    html = html.replace(/^(?!<[a-z]).+$/gm, '<p class="my-2">$&</p>');

    // Make sure paragraphs have proper spacing
    html = html.replace(/<p class="my-2">/g, '<p class="my-2" style="margin: 0.25rem 0; line-height: 1.2;">');

    // Ensure double line breaks create proper paragraph spacing
    html = html.replace(/\n\n+/g, '</p>\n\n<p class="my-2" style="margin: 0.25rem 0; line-height: 1.2;">');

    // Fix any remaining line breaks that should be visible
    html = html.replace(/\n(?!<)/g, '<br>');

    return html;
  };

  return (
    <div className="border border-gray-600 rounded-md overflow-hidden bg-gray-800">
      <div className="bg-gray-700 p-2 border-b border-gray-600 text-white">
        <div className="flex mb-2">
          <button
            type="button"
            onClick={() => setSelectedTab('write')}
            className={`px-4 py-1 rounded-md ${selectedTab === 'write' ? 'bg-gray-800 shadow-sm text-white' : 'hover:bg-gray-600 text-gray-200'}`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('preview')}
            className={`px-4 py-1 ml-2 rounded-md ${selectedTab === 'preview' ? 'bg-gray-800 shadow-sm text-white' : 'hover:bg-gray-600 text-gray-200'}`}
          >
            Preview
          </button>
        </div>

        {selectedTab === 'write' && (
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={handleBold}
              className="p-1 hover:bg-gray-600 rounded text-white"
              title="Bold (Ctrl+B)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h8a4 4 0 100-8H6v8zm0 0h8a4 4 0 110 8H6v-8z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleItalic}
              className="p-1 hover:bg-gray-600 rounded text-white"
              title="Italic (Ctrl+I)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </button>
            <div className="h-5 border-l border-gray-500 mx-1"></div>
            <button
              type="button"
              onClick={() => handleHeading(1)}
              className="p-1 hover:bg-gray-600 rounded text-white"
              title="Heading 1"
            >
              <span className="font-bold">H1</span>
            </button>
            <button
              type="button"
              onClick={() => handleHeading(2)}
              className="p-1 hover:bg-gray-600 rounded text-white"
              title="Heading 2"
            >
              <span className="font-bold">H2</span>
            </button>
            <button
              type="button"
              onClick={() => handleHeading(3)}
              className="p-1 hover:bg-gray-600 rounded text-white"
              title="Heading 3"
            >
              <span className="font-bold">H3</span>
            </button>
            <div className="h-5 border-l border-gray-500 mx-1"></div>
            <button
              type="button"
              onClick={() => handleList('unordered')}
              className="p-1 hover:bg-gray-600 rounded text-white"
              title="Bullet List"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => handleList('ordered')}
              className="p-1 hover:bg-gray-600 rounded text-white"
              title="Numbered List"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h10M7 16h10M3 8h.01M3 12h.01M3 16h.01" />
              </svg>
            </button>
            <div className="h-5 border-l border-gray-500 mx-1"></div>
            <button
              type="button"
              onClick={handleLink}
              className="p-1 hover:bg-gray-600 rounded text-white"
              title="Insert Link"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleImage}
              className="p-1 hover:bg-gray-600 rounded text-white"
              title="Insert Image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleQuote}
              className="p-1 hover:bg-gray-600 rounded text-white"
              title="Blockquote"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleCode}
              className="p-1 hover:bg-gray-600 rounded text-white"
              title="Inline Code"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleCodeBlock}
              className="p-1 hover:bg-gray-600 rounded text-white"
              title="Code Block"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleHorizontalRule}
              className="p-1 hover:bg-gray-600 rounded text-white"
              title="Horizontal Rule"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {selectedTab === 'write' ? (
        <textarea
          ref={textareaRef}
          className="w-full min-h-[400px] p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono bg-gray-800 text-white border-0"
          value={editorContent}
          onChange={handleChange}
          placeholder="Write your content here using Markdown..."
        />
      ) : (
        <div className="w-full min-h-[400px] p-4 prose max-w-none overflow-auto bg-gray-800 text-white" style={{ lineHeight: 1.2, fontFamily: '"Merriweather", serif' }}>
          <style>
            {`
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
                margin: 0 !important;
                padding-left: 1.5rem !important;
              }

              .preview-content ul li {
                list-style-type: disc !important;
                margin: 0 !important;
                padding: 0 !important;
                line-height: 1 !important;
              }

              .preview-content ol li {
                list-style-type: decimal !important;
                margin: 0 !important;
                padding: 0 !important;
                line-height: 1 !important;
              }

              /* Fix spacing for bullet points and paragraphs */
              .preview-content li p {
                margin-top: 0 !important;
                margin-bottom: 0 !important;
              }

              /* Fix spacing for consecutive bullet points */
              .preview-content li + li {
                margin-top: 0 !important;
              }

              /* Ensure headings display properly */
              .preview-content h1 {
                font-size: 1.875rem !important;
                font-weight: 700 !important;
                margin: 0.5rem 0 0 !important;
                line-height: 1 !important;
              }

              .preview-content h2 {
                font-size: 1.5rem !important;
                font-weight: 700 !important;
                margin: 0.5rem 0 0 !important;
                line-height: 1 !important;
              }

              .preview-content h3 {
                font-size: 1.25rem !important;
                font-weight: 700 !important;
                margin: 0.5rem 0 0 !important;
                line-height: 1 !important;
              }

              /* Set font for all preview content */
              .preview-content {
                font-family: 'Merriweather', serif !important;
              }

              /* Use Source Code Pro for code blocks */
              .preview-content code,
              .preview-content pre {
                font-family: 'Source Code Pro', monospace !important;
              }

              /* Ensure paragraphs display properly */
              .preview-content p {
                margin: 0 !important;
                line-height: 1 !important;
              }

              /* Reduce spacing between paragraphs */
              .preview-content p + p {
                margin-top: 0 !important;
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
                margin: 1rem 0 !important;
                border: 0 !important;
                border-top: 1px solid #d1d5db !important;
              }

              /* Reduce spacing between all elements */
              .preview-content * + * {
                margin-top: 0 !important;
              }

              /* Fix spacing for bullet points after headings */
              .preview-content h1 + ul,
              .preview-content h2 + ul,
              .preview-content h3 + ul,
              .preview-content h1 + ol,
              .preview-content h2 + ol,
              .preview-content h3 + ol {
                margin-top: 0 !important;
              }
            `}
          </style>
          <div
            className="preview-content"
            style={{ fontFamily: '"Merriweather", serif' }}
            dangerouslySetInnerHTML={{ __html: markdownToHtml(editorContent) }}
          />
          {editorContent.includes('![') && (
            <div className="mt-4 p-2 bg-blue-50 text-blue-700 rounded-md text-sm">
              <p><strong>Note:</strong> Images are displayed in the preview. If you don't see an image, check that the URL is correct and accessible.</p>
            </div>
          )}
        </div>
      )}

      {/* Image Upload Modal removed */}

      <div className="bg-gray-700 p-2 border-t border-gray-600 text-xs text-gray-300">
        <p>Use Markdown for formatting. <a href="https://www.markdownguide.org/cheat-sheet/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Markdown Cheat Sheet</a></p>
      </div>
    </div>
  );
}
