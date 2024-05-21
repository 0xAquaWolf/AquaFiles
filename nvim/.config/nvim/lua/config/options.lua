-- Options are automatically loaded before lazy.nvim startup
-- Default options that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/options.lua
-- Add any additional options here
--
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
opt.linebreak = true
