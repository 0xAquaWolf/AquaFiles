-- Default keymaps that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/keymaps.lua
-- Keymaps are automatically loaded on the VeryLazy event
-- Add any additional keymaps here
local keymap = vim.keymap
-- remap esc to jj for easier access
keymap.set("i", "jj", "<Esc>", { noremap = false })
-- enable and disable completions engine
keymap.set("n", "<leader>p", '<cmd>lua require("cmp").setup { enabled = true }<cr>', { desc = "Enable completion" })
keymap.set("n", "<leader>P", "<cmd>lua require('cmp').setup { enabled = false}<cr>", { desc = "Disable completion" })

-- these keymaps allow you to take highlighted text and then move it up and down with JK
keymap.set("v", "J", ":m '>+1<CR>gv=gv", { noremap = true, silent = true })
keymap.set("v", "K", ":m '<-2<CR>gv=gv", { noremap = true, silent = true })

-- insert the date in my desired configuration
-- example of how to run a script through keymap
-- keymap.set("n", "<leader>d", "<cmd>r!gendate<cr>", { desc = "Insert Date" })
--
-- telescope symbols
keymap.set("n", "<leader>fs", "<cmd>Telescope symbols<cr>", { desc = "Find Symbols" })

-- Markdown preview
keymap.set("n", "<leader>po", "<cmd>PeekOpen<cr>", { desc = "Peek Open" })
keymap.set("n", "<leader>pc", "<cmd>PeekClose<cr>", { desc = "Peek Close" })

-- these keep the cursor in the middle when scrolling with ctrl d and u
keymap.set("n", "<C-d>", "<C-d>zz")
keymap.set("n", "<C-u>", "<C-u>zz")

-- and these are for searching
keymap.set("n", "n", "nzzzv")
keymap.set("n", "N", "Nzzzv")

keymap.set("n", "<leader>oc", "<cmd>CreateObsidianFile<cr>", { desc = "Create Obsidian File" })
keymap.set("n", "<leader>or", "<cmd>RenameObsidianFile<cr>", { desc = "Rename Obsidian File" })
keymap.set("n", "<leader>od", "<cmd>DeleteObsidianFile<cr>", { desc = "Delete Obsidian File" })

-- examples
-- convert Current line to title cases
-- vim.keymap.set(
--   "n",
--   "<leader>rlt",
--   "<cmd>lua require('textcase').current_word('to_title_case')<CR>",
--   { desc = "Replace Line Title" }
-- )
