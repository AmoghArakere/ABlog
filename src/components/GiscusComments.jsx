import React, { useEffect, useRef, useState } from 'react';

// NOTE: To use Giscus, you need to:
// 1. Install the Giscus GitHub App on your repository: https://github.com/apps/giscus
// 2. Enable GitHub Discussions on your repository
// 3. Get the repository ID and category ID from https://giscus.app/

export default function GiscusComments({
  // Replace these values with your actual repository information
  repo = "AmoghArakere/ABlog",
  repoId = "R_kgDOLXXXXX", // Get this from https://giscus.app/
  category = "Announcements",
  categoryId = "DIC_kwDOLXXXXXXXXX", // Get this from https://giscus.app/
  mapping = "pathname",
  term = "",
  strict = "0",
  reactionsEnabled = "1",
  emitMetadata = "0",
  inputPosition = "top",
  theme = "dark",
  lang = "en",
  loading = "lazy"
}) {
  const [isConfigured, setIsConfigured] = useState(false);
  const containerRef = useRef(null);
  const isGiscusLoaded = useRef(false);

  useEffect(() => {
    // Check if the repository ID and category ID are properly configured
    const isProperlyConfigured =
      repoId !== "R_kgDOLXXXXX" &&
      categoryId !== "DIC_kwDOLXXXXXXXXX" &&
      repoId.startsWith('R_') &&
      categoryId.startsWith('DIC_');

    setIsConfigured(isProperlyConfigured);

    if (!isProperlyConfigured) {
      console.warn('[GiscusComments] Giscus is not properly configured. Please update the repository ID and category ID.');
      return;
    }

    if (!containerRef.current || isGiscusLoaded.current) return;

    console.log('[GiscusComments] Initializing Giscus...');
    isGiscusLoaded.current = true;

    const script = document.createElement('script');
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", repo);
    script.setAttribute("data-repo-id", repoId);
    script.setAttribute("data-category", category);
    script.setAttribute("data-category-id", categoryId);
    script.setAttribute("data-mapping", mapping);
    script.setAttribute("data-strict", strict);
    script.setAttribute("data-reactions-enabled", reactionsEnabled);
    script.setAttribute("data-emit-metadata", emitMetadata);
    script.setAttribute("data-input-position", inputPosition);
    script.setAttribute("data-theme", theme);
    script.setAttribute("data-lang", lang);
    script.setAttribute("data-loading", loading);
    script.crossOrigin = "anonymous";
    script.async = true;

    // Clean up previous instance if it exists
    const existingScript = containerRef.current.querySelector('script');
    if (existingScript) {
      containerRef.current.removeChild(existingScript);
    }

    // Add the new script
    containerRef.current.appendChild(script);

    // Cleanup function
    return () => {
      console.log('[GiscusComments] Cleaning up Giscus...');
      if (containerRef.current) {
        const script = containerRef.current.querySelector('script');
        if (script) {
          containerRef.current.removeChild(script);
        }
      }
      isGiscusLoaded.current = false;
    };
  }, [repo, repoId, category, categoryId, mapping, term, strict, reactionsEnabled, emitMetadata, inputPosition, theme, lang, loading]);

  if (!isConfigured) {
    return (
      <div className="giscus-wrapper mt-6 p-4 border border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700 rounded-md">
        <h4 className="text-lg font-semibold text-yellow-700 dark:text-yellow-500 mb-2">Giscus Configuration Required</h4>
        <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-2">
          To enable GitHub Discussions comments on your blog posts, you need to configure Giscus properly:
        </p>
        <ol className="list-decimal list-inside text-sm text-yellow-600 dark:text-yellow-400 space-y-1 ml-2">
          <li>Install the <a href="https://github.com/apps/giscus" target="_blank" rel="noopener noreferrer" className="underline">Giscus GitHub App</a> on your repository</li>
          <li>Enable GitHub Discussions on your repository</li>
          <li>Get the repository ID and category ID from <a href="https://giscus.app/" target="_blank" rel="noopener noreferrer" className="underline">giscus.app</a></li>
          <li>Update the GiscusComments component with your repository information</li>
        </ol>
      </div>
    );
  }

  return (
    <div className="giscus-wrapper mt-6" ref={containerRef}>
      {/* Giscus will be loaded here */}
    </div>
  );
}
