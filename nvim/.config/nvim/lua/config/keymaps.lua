-- Default keymaps that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/keymaps.lua
-- Keymaps are automatically loaded on the VeryLazy event
-- Add any additional keymaps here
local keymap = vim.keymap

-- enable and disable completions engine
keymap.set("n", "<leader>p", '<cmd>lua require("cmp").setup { enabled = true }<cr>', { desc = "Enable completion" })
keymap.set("n", "<leader>P", "<cmd>lua require('cmp').setup { enabled = false}<cr>", { desc = "Disable completion" })

-- insert the date in my desired configuration
keymap.set("n", "<leader>d", "<cmd>r!gendate<cr>", { desc = "Insert Date" })
keymap.set("n", "<leader>d", "<cmd>r!gendate h 2<cr>", { desc = "Insert date h2" })
keymap.set("n", "<leader>d", "<cmd>r!gendate h 1<cr>", { desc = "Insert date h1" })

keymap.set("i", "jj", "<Esc>", { noremap = false })
