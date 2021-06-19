import { App } from "vue";

import VueTippy from "vue-tippy";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

function applyTippy<TElement>(app: App<TElement>): App<TElement> {
  return app.use(VueTippy, {
    component: "tippy",
    defaultProps: {
      theme: "light",
      arrow: false,
      hideOnClick: false,
      duration: 150,
      placement: "right-start",
    },
  });
}

export default applyTippy;
