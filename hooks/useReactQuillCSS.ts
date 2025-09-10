import { useEffect } from 'react';

let cssLoaded = false;

export const useReactQuillCSS = () => {
  useEffect(() => {
    if (!cssLoaded && typeof window !== 'undefined') {
      // Dynamically import ReactQuill CSS only when needed
      import('react-quill/dist/quill.snow.css');
      cssLoaded = true;
    }
  }, []);
};
