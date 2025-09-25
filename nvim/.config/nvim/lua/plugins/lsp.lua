return {
  "neovim/nvim-lspconfig",
  opts = function(_, opts)
    local keys = require("lazyvim.plugins.lsp.keymaps").get()
    -- Disable the default LSP <leader>cc mapping
    keys[#keys + 1] = { "<leader>cc", false }
    -- Add your custom mapping
    keys[#keys + 1] = {
      "<leader>cc",
      "<cmd>ClaudeCode<CR>",
      desc = "Toggle Claude Code",
    }
    servers = {
      eslint = {
        filetypes = {
          "javascript",
          "javascriptreact",
          "javascript.jsx",
          "typescript",
          "typescriptreact",
          "typescript.tsx",
          "vue",
          "html",
          "markdown",
          "json",
          "jsonc",
          "yaml",
          "toml",
          "xml",
          "gql",
          "graphql",
          "astro",
          "svelte",
          "css",
          "less",
          "scss",
          "pcss",
          "postcss"
        },
        settings = {
          -- Working with flat config
          useFlatConfig = true,
          -- Silent the stylistic rules in IDE, but still auto fix them
          rulesCustomizations = {
            { rule = 'style/*', severity = 'off', fixable = true },
            { rule = 'format/*', severity = 'off', fixable = true },
            { rule = '*-indent', severity = 'off', fixable = true },
            { rule = '*-spacing', severity = 'off', fixable = true },
            { rule = '*-spaces', severity = 'off', fixable = true },
            { rule = '*-order', severity = 'off', fixable = true },
            { rule = '*-dangle', severity = 'off', fixable = true },
            { rule = '*-newline', severity = 'off', fixable = true },
            { rule = '*quotes', severity = 'off', fixable = true },
            { rule = '*semi', severity = 'off', fixable = true },
          },
        },
        -- Enable auto-fix on save
        on_attach = function(client, bufnr)
          vim.api.nvim_create_autocmd("BufWritePre", {
            buffer = bufnr,
            command = "EslintFixAll",
          })
        end,
      },
      tsserver = {
        settings = {
          typescript = {
            preferences = {
              importModuleSpecifier = "relative",
            },
          },
          javascript = {
            preferences = {
              importModuleSpecifier = "relative",
            },
          },
        },
      },
    }
  end,
}
