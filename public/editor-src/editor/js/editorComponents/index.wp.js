import nonWP from "./index.js";
// import WPPosts from "./WordPress/WPPosts";
import WPSidebar from "./WordPress/WPSidebar";
import WPCustomShortcode from "./WordPress/WPCustomShortcode";
import WPNavigation from "./WordPress/WPNavigation";
import WOOProducts from "./WordPress/WOOProducts";
import WOOProductPage from "./WordPress/WOOProductPage";
import WOOCategories from "./WordPress/WOOCategories";
// import WOOAddToCart from "./WordPress/WOOAddToCart";
import WOOPages from "./WordPress/WOOPages";

import { hasSidebars, pluginActivated } from "visual/utils/wp";

export default {
  ...nonWP,
  ...(hasSidebars() ? { WPSidebar } : {}),
  WPCustomShortcode,
  WPNavigation,
  ...(pluginActivated("woocommerce")
    ? {
        WOOProducts,
        WOOProductPage,
        WOOCategories,
        WOOPages
      }
    : {})
};

export { NotFoundComponent } from "./index.js";
