import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset scroll position về đầu trang
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
