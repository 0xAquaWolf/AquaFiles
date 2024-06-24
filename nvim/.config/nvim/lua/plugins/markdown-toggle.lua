return {
	{
		"nvim-lua/plenary.nvim",
		lazy = true,
		keys = {
			{
				"<leader>l",
				function()
					local line = vim.api.nvim_get_current_line()
					local enter_insert = false

					if line:match("^%s*-%s*%[x]") then
						-- If the line is a checked todo item, remove the checkbox and dash
						line = line:gsub("^%s*-%s*%[x]%s*", "", 1)
					elseif line:match("^%s*-%s*%[ ]") then
						-- If the line is an unchecked todo item, check it
						line = line:gsub("%[ ]", "[x]", 1)
					elseif line:match("^%s*$") or not line:match("^%s*-%s*") then
						-- If the line is empty or doesn't start with a dash, add an unchecked item
						line = "- [ ] " .. line:gsub("^%s*", "")
						enter_insert = true
					else
						-- If the line starts with a dash but no checkbox, add an unchecked box
						line = line:gsub("^(%s*-)%s*", "%1 [ ] ", 1)
					end

					vim.api.nvim_set_current_line(line)

					if enter_insert then
						local col = #line
						vim.api.nvim_win_set_cursor(0, { vim.fn.line("."), col })
						vim.cmd("startinsert!")
					end
				end,
				desc = "Toggle Markdown Task",
			},
		},
	},
}
