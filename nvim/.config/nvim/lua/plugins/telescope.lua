-- if true then
-- 	return {}
-- end

return {
	{
		"nvim-telescope/telescope.nvim",
		keys = {
			{ "<leader>ff", "<cmd>Telescope find_files<cr>", desc = "Find Files Telescope" },
			{
				"<leader><space>",
				LazyVim.pick("find_files", { no_ignore = true, default_text = line }),
				desc = "Find Files (Root Dir)",
			},
			{
				"<leader>fp",
				function()
					require("telescope.builtin").find_files({ cwd = require("lazy.core.config").options.root })
				end,
				desc = "Find Plugin File",
			},
		},
		opts = {
			pickers = {
				find_files = {
					find_command = { "rg", "--files", "--glob", "!**/{.git,node_modules}/*", "-L" },
				},
			},
		},
	},
	{
		"telescope.nvim",
		dependencies = {
			"nvim-telescope/telescope-fzf-native.nvim",
			build = "make",
			config = function()
				require("telescope").load_extension("fzf")
			end,
		},
	},
	-- {
	-- 	"nvim-telescope/telescope-symbols.nvim",
	-- },

	-- Custom ripgrep configuration:

	-- I want to search in hidden/dot files.
	-- "--hidden"
	--
	-- I don't want to search in the `.git` directory.
	-- "--glob")
	-- "!**/.git/*")
	--
	--  I want to follow symbolic links
	-- "-L"
	--
}
