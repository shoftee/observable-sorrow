import { createApp } from "vue";
import VueRx from "@nopr3d/vue-next-rx";
import App from "./App.vue";

import "../node_modules/bootstrap/scss/bootstrap.scss";
import "./styles/main.scss";

createApp(App)
    .use(VueRx)
    .mount("#app");
