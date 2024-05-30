-- if true then
-- 	return {}
-- end

return {
	"nvim-telescope/telescope.nvim",
	-- keys = {
	-- 	{ "<leader>ff", "<cmd>Telescope find_files<cr>", desc = "Find Files Telescope" },
	-- },
	opts = {
		pickers = {
			find_files = {
				-- follow = true,
				find_command = { "rg", "--files", "--glob", "!**/{.git,node_modules}/*", "-L" },
			},
		},
	},
}
