-- Options are automatically loaded before lazy.nvim startup
-- Default options that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/options.lua
-- Add any additional options here

local opt = vim.opt

opt.ignorecase = true

-- pandoc related
opt.spell = false
opt.foldmethod = "manual"
opt.foldenable = false

-- scrolling
opt.number = true
opt.relativenumber = true
opt.scrolloff = 8

opt.cursorline = false

vim.g.lazyvim_php_lsp = "intelephense"

-- Check if clipboard support is available
if vim.fn.has("clipboard") == 1 then
  -- Set the '+' register for clipboard operations
  opt.clipboard:append("unnamedplus")
end
