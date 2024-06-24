return {
	{
		"nvim-lua/plenary.nvim",
		lazy = true,
		keys = {
			{
				"<leader>l",
				function()
					local line = vim.api.nvim_get_current_line()

					if line:match("^%s*-%s*%[x]") then
						-- If the line is a checked todo item, remove the checkbox and dash
						line = line:gsub("^%s*-%s*%[x]%s*", "", 1)
					elseif line:match("^%s*-%s*%[ ]") then
						-- If the line is an unchecked todo item, check it
						line = line:gsub("%[ ]", "[x]", 1)
					elseif line:match("^%s*$") or not line:match("^%s*-%s*") then
						-- If the line is empty or doesn't start with a dash, add an unchecked item
						line = "- [ ] " .. line:gsub("^%s*", "")
					else
						-- If the line starts with a dash but no checkbox, add an unchecked box
						line = line:gsub("^(%s*-)%s*", "%1 [ ] ", 1)
					end
					vim.api.nvim_set_current_line(line)
				end,
				desc = "Toggle Markdown Task",
			},
		},
	},
}
