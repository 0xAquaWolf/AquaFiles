return {
	{
		"nvim-lua/plenary.nvim",
		lazy = true,
		keys = {
			{
				"<leader>l",
				function()
					local line = vim.api.nvim_get_current_line()
					if line:match("^%s*-%s*%[[ ]?]") then
						line = line:gsub("%[[ ]?]", "[x]", 1)
					elseif line:match("^%s*-%s*%[x]") then
						line = line:gsub("%[x]", "[ ]", 1)
					end
					vim.api.nvim_set_current_line(line)
				end,
				desc = "Toggle Markdown Task",
			},
		},
	},
}
