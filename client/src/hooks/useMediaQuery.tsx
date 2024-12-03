import {useEffect, useState} from "react";

export function useMediaQuery() {
  const query = window.matchMedia("(max-width: 700px)");
  const [isMobile, setIsMobile] = useState(query.matches);

  useEffect(() => {
    const handler = () => {
      setIsMobile(query.matches);
    }
    query.addEventListener("change", handler);
    return () => {
      query.removeEventListener("change", handler);
    }
  }, []);

  return [isMobile];
}