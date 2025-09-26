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
      json = { "prettier" },
      jsonc = { "prettier" },
      yaml = { "prettier" },
      yml = { "prettier" },
      markdown = { "prettier" },
      html = { "eslint_d", "eslint", "prettier" },
      css = { "eslint_d", "eslint", "prettier" },
      scss = { "eslint_d", "eslint", "prettier" },
      less = { "eslint_d", "eslint", "prettier" },
      toml = { "prettier" },
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
