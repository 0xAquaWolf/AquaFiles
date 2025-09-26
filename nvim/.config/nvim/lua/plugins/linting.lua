-- Custom linting configuration for @antfu/eslint-config
-- Since we're using lazyvim.plugins.extras.linting.eslint, this provides overrides
return {
  "mfussenegger/nvim-lint",
  opts = {
    -- Additional linters by filetype (supplements LazyVim ESLint extra)
    linters_by_ft = {
      -- @antfu/eslint-config supports these additional file types
    },

    linters = {
      eslint = {
        -- Condition to check for eslint config files (including flat config)
        condition = function(ctx)
          local config_files = {
            "eslint.config.js",
            "eslint.config.ts",
            ".eslintrc.js",
            ".eslintrc.json",
          }
          return vim.fs.find(config_files, { path = ctx.filename, upward = true })[1]
        end,
      },
    },
  },
}
