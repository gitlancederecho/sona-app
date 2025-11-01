// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"], // includes expo-router automatically on SDK 50+
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            src: "./src", // so you can import from "src/..." cleanly
          },
        },
      ],
    ],
  };
};
