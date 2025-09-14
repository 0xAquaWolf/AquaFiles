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
  end,
}
