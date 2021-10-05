import { App } from "vue";

import VueTippy from "vue-tippy";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import "tippy.js/animations/shift-away.css";

// Docs for Vue 3 Tippy here: https://vue-tippy.netlify.app/
function applyTippy<TElement>(app: App<TElement>): App<TElement> {
  return app.use(VueTippy, {
    component: "tippy",
    defaultProps: {
      animation: "shift-away",
      theme: "light",
      arrow: false,
      hideOnClick: false,
      duration: 150,
      placement: "right-start",
    },
  });
}

export default applyTippy;
