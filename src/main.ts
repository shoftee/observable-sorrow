import "../node_modules/bootstrap-icons/font/bootstrap-icons.css";
import "./styles/main.scss";

import { App, createApp } from "vue";
import AppComponent from "./App.vue";
const app: App<Element> = createApp(AppComponent);

// add vue-rx
import VueRx from "@nopr3d/vue-next-rx";
app.use(VueRx);

// add vue-tippy
import applyTippy from "./plugins/tippy";
applyTippy(app);

// add vue-i18n
import applyI18n from "./plugins/vue-i18n";
applyI18n(app);

// mount app to page
app.mount("#app");
