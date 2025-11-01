module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@': '.',      // ← map "@" to the project root so "@/components/..." works
            src: './src'   // ← keep our nice "src/..." alias too
          }
        }
      ]
    ]
  };
};
