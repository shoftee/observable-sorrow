import VueRx from "@nopr3d/vue-next-rx";

import "../node_modules/bootstrap-icons/font/bootstrap-icons.css";
import "./styles/main.scss";

import { createApp } from "vue";
import App from "./App.vue";
createApp(App).use(VueRx).mount("#app");
