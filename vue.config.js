module.exports = {
  publicPath:
    process.env.NODE_ENV === "production" ? "/observable-sorrow/" : "/",
  chainWebpack: (config) => {
    if (process.env.NODE_ENV === "test") {
      // if unit testing, keep original lines to make breakpoints in original source files work
      config.merge({
        devtool: "cheap-module-eval-source-map",
      });
    } else {
      // if not unit testing, use normal source maps
      config.merge({
        devtool: "source-map",
      });
    }
  },
};
