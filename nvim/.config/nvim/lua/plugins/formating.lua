return {
  "stevearc/conform.nvim",
  opts = {
    formatters_by_ft = {
      -- @antfu/eslint-config handles formatting for these files
      javascript = { "eslint_d", "eslint" },
      typescript = { "eslint_d", "eslint" },
      javascriptreact = { "eslint_d", "eslint" },
      typescriptreact = { "eslint_d", "eslint" },
      vue = { "eslint_d", "eslint" },
      json = { "eslint_d", "eslint", "prettier" },
      jsonc = { "eslint_d", "eslint" },
      yaml = { "eslint_d", "eslint", "prettier" },
      yml = { "eslint_d", "eslint", "prettier" },
      markdown = { "eslint_d", "eslint", "prettier" },
      html = { "eslint_d", "eslint", "prettier" },
      css = { "eslint_d", "eslint", "prettier" },
      scss = { "eslint_d", "eslint", "prettier" },
      less = { "eslint_d", "eslint", "prettier" },
      toml = { "eslint_d", "eslint" },
    },
    formatters = {
      eslint_d = {
        condition = function(self, ctx)
          local config_files = {
            "eslint.config.js",
            "eslint.config.mjs",
            "eslint.config.cjs",
            "eslint.config.ts",
            ".eslintrc.js",
            ".eslintrc.cjs",
            ".eslintrc.yaml",
            ".eslintrc.yml",
            ".eslintrc.json",
          }
          return vim.fs.find(config_files, { path = ctx.filename, upward = true })[1]
        end,
      },
    },
  },
}
