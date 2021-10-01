module.exports = {
  transpileDependencies: true,
  publicPath:
    process.env.NODE_ENV === "production" ? "/observable-sorrow/" : "/",
  chainWebpack: (config) => {
    config.merge({
      devtool:
        process.env.NODE_ENV === "test"
          ? "cheap-module-source-map" // keep original lines for breakpoints
          : "source-map",
    });
  },
};
