import { App } from "vue";

import VueTippy from "vue-tippy";

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
