import "../node_modules/bootstrap-icons/font/bootstrap-icons.css";
import "./styles/main.scss";

import { App, createApp } from "vue";
import AppComponent from "./App.vue";
const app: App<Element> = createApp(AppComponent);

// add vue-rx
import VueRx from "@nopr3d/vue-next-rx";
app.use(VueRx);

// add vue-tippy
import useTippy from "./plugins/tippy";
useTippy(app);

// mount app to page
app.mount("#app");
