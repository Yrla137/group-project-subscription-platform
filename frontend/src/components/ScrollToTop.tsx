import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Scrolls to the top whenever the page (path) changes
export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}