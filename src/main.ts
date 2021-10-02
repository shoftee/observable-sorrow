import "../node_modules/bootstrap-icons/font/bootstrap-icons.css";
import "./styles/main.scss";

import { App, createApp } from "vue";

import AppComponent from "./App.vue";
const app: App<Element> = createApp(AppComponent);

// add vue-tippy
import applyTippy from "./plugins/tippy";
applyTippy(app);

// add vue-i18n
import applyI18n from "./plugins/vue-i18n";
applyI18n(app);

import { proxy } from "comlink";
import { Interactor, Presenters } from "./app/os";
import { OnTickedHandler } from "./_interfaces";

const handler: OnTickedHandler = function (changes) {
  return Presenters.root.update(changes);
};

// intialize game
Interactor.onTicked(proxy(handler))
  // start game
  .then(async () => await Interactor.start())
  // mount app to page
  .then(() => app.mount("#app"));
