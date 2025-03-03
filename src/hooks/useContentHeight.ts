import { useCallback, useLayoutEffect, useState } from "react";

export function useContentHeight() {
  const [contentHeight, setContentHeight] = useState(0);

  const genHeight = useCallback(() => {
    const content = document.querySelector(".table-wrapper");

    if (content) {
      const root = document.querySelector(":root") as HTMLElement;

      root.style.setProperty(
        "--table-wrapper-height",
        '0'
      );
      const height = content.getBoundingClientRect().height;
      setContentHeight(height);

      root.style.setProperty(
        "--table-wrapper-height",
        `${content.getBoundingClientRect().height}px`
      );
    }
  }, [])

  useLayoutEffect(() => {
    genHeight()

    window.addEventListener('resize', genHeight)

    return () => {
      window.removeEventListener('resize', genHeight)

      const root = document.querySelector(":root") as HTMLElement;

      root.style.setProperty(
        "--table-wrapper-height",
        '0'
      );
    }
  }, [genHeight]);

  return {
    contentHeight,
  };
}
