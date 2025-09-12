return {
	-- add symbols-outline
	{
		"shortcuts/no-neck-pain.nvim",
		cmd = "NoNeckPain",
		keys = {
			{ "<leader>pn", "<cmd>NoNeckPain<cr>", desc = "[N]o [N]eckpain" },
			{ "<leader>p", "", desc = "+no neckpain" },
		},
		opts = {},
		-- config = function()
		--   require("no-neck-pain").setup({
		--     width = 80,
		--   })
		-- end,
	},
}
