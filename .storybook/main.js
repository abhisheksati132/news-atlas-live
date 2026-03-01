module.exports = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx|mdx)"],
  addons: ["@storybook/addon-essentials"],
  framework: {
    name: "@storybook/react",
    options: {}
  },
  webpackFinal: async (config) => {
    return config;
  },
};
