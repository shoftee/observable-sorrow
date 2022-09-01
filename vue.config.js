module.exports = {
  transpileDependencies: true,

  // github.io URL includes repo name
  publicPath:
    process.env.NODE_ENV === "production" ? "/observable-sorrow/" : "/",

  chainWebpack: (config) => {
    if (process.env.NODE_ENV === "test") {
      // keep original lines for breakpoints
      config.devtool("inline-cheap-module-source-map");
    } else {
      config.devtool("source-map");
    }

    // Credit https://github.com/intlify/vue-i18n-next/issues/789#issuecomment-1164253341
    config.plugin('define').tap((definitions) => {
      Object.assign(definitions[0], {
        // get rid of vue-i18n warning
        __VUE_I18N_FULL_INSTALL__: JSON.stringify(true),
        __INTLIFY_PROD_DEVTOOLS__: JSON.stringify(false),
        __VUE_I18N_LEGACY_API__: JSON.stringify(false),
      })

      return definitions
    })
  },
};
