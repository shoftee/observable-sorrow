import en from "@/locales/en.json";
import { createI18n } from "vue-i18n";

// tslint:disable-next-line:typedef
const i18n = createI18n({
  legacy: false,
  locale: "en",
  fallbackLocale: "en",
  flatJson: true,
  messages: {
    en,
  },
});

import { App } from "vue";
function applyI18n<TElement>(app: App<TElement>): App<TElement> {
  app.use(i18n);
  return app;
}

export default applyI18n;

// later: lazy loading https://vue-i18n.intlify.dev/guide/advanced/lazy.html
