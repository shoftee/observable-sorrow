module.exports = {
  transpileDependencies: true,
  publicPath:
    process.env.NODE_ENV === "production" ? "/observable-sorrow/" : "/",
  chainWebpack: (config) => {
    if (process.env.NODE_ENV === "test") {
      // keep original lines for breakpoints
      config.devtool("inline-cheap-module-source-map");
    } else {
      config.devtool("source-map");
    }
  },
};
