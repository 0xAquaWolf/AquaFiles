-- Custom linting configuration for @antfu/eslint-config
-- Since we're using lazyvim.plugins.extras.linting.eslint, this provides overrides
return {
  "mfussenegger/nvim-lint",
  opts = {
    -- Additional linters by filetype (supplements LazyVim ESLint extra)
    linters_by_ft = {
      -- @antfu/eslint-config supports these additional file types
      vue = { "eslint" },
      html = { "eslint" },
      json = { "eslint" },
      jsonc = { "eslint" },
      yaml = { "eslint" },
      markdown = { "eslint" },
      css = { "eslint" },
      scss = { "eslint" },
      less = { "eslint" },
      toml = { "eslint" },
    },
    
    linters = {
      eslint = {
        -- Condition to check for eslint config files (including flat config)
        condition = function(ctx)
          local config_files = {
            "eslint.config.js",
            "eslint.config.mjs", 
            "eslint.config.cjs",
            "eslint.config.ts",
            ".eslintrc.js",
            ".eslintrc.cjs",
            ".eslintrc.yaml",
            ".eslintrc.yml",
            ".eslintrc.json"
          }
          return vim.fs.find(config_files, { path = ctx.filename, upward = true })[1]
        end,
      },
    },
  },
}