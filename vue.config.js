module.exports = {
  transpileDependencies: true,
  publicPath:
    process.env.NODE_ENV === "production" ? "/observable-sorrow/" : "/",
  chainWebpack: (config) => {
    if (process.env.NODE_ENV === "test") {
      if (process.env.coverage === "true") {
        config.module
          .rule("ts")
          .use("istanbul")
          .loader("istanbul-instrumenter-loader")
          .options({ esModules: true })
          .before("ts-loader");
      }

      config.devtool("inline-cheap-module-source-map"); // keep original lines for breakpoints
    } else {
      config.devtool("source-map");
    }
  },
};
