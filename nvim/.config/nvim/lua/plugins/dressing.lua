return {
	"stevearc/dressing.nvim",
	opts = {},
	config = function()
		require("dressing").setup({
			input = {
				-- Default prompt string
				default_prompt = "Input",
				-- Trim trailing `:` from prompt
				trim_prompt = true,
				-- Can be 'left', 'right', or 'center'
				title_pos = "left",
				-- These are passed to nvim_open_win
				border = "rounded",
				-- 'editor' and 'win' will default to being centered
				relative = "cursor",
			},
		})
	end,
}
