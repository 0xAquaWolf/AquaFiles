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
						line = line:gsub("^%s*-%s*%[x]%s*", "", 1)
					elseif line:match("^%s*-%s*%[ ]") then
						line = line:gsub("%[ ]", "[x]", 1)
					elseif line:match("^%s*$") or not line:match("^%s*-%s*") then
						line = "- [ ] " .. line:gsub("^%s*", "")
						enter_insert = true
					else
						line = line:gsub("^(%s*-)%s*", "%1 [ ] ", 1)
					end
					vim.api.nvim_set_current_line(line)
					if enter_insert then
						local col = #line
						vim.api.nvim_win_set_cursor(0, { vim.fn.line("."), col })
						vim.cmd("startinsert!")
					end
				end,
				desc = "Toggle Markdown Task (Normal Mode)",
				mode = "n",
			},
			{
				"<C-l>",
				function()
					local toggle_todo = function()
						local line = vim.api.nvim_get_current_line()
						local cursor = vim.api.nvim_win_get_cursor(0)
						local row, col = cursor[1], cursor[2]

						if line:match("^%s*-%s*%[x]") then
							line = line:gsub("^%s*-%s*%[x]%s*", "", 1)
							col = math.max(0, col - 6)
						elseif line:match("^%s*-%s*%[ ]") then
							line = line:gsub("%[ ]", "[x]", 1)
						elseif line:match("^%s*$") or not line:match("^%s*-%s*") then
							line = "- [ ] " .. line:gsub("^%s*", "")
							col = col + 6
						else
							line = line:gsub("^(%s*-)%s*", "%1 [ ] ", 1)
							col = col + 4
						end

						vim.api.nvim_buf_set_lines(0, row - 1, row, false, { line })
						vim.api.nvim_win_set_cursor(0, { row, math.min(col, #line) })
					end

					vim.api.nvim_input("<Esc>")
					toggle_todo()
					vim.api.nvim_input("a")
				end,
				desc = "Toggle Markdown Task (Insert Mode)",
				mode = "i",
			},
			{
				"<C-l>",
				function()
					-- Get the start and end lines of the visual selection
					-- local start_line, _ = unpack(vim.fn.getpos("'<"), 2, 3)
					-- local end_line, _ = unpack(vim.fn.getpos("'>"), 2, 3)
					-- local lines = vim.fn.getline(start_line, end_line)
					vim.cmd("ObsidianToggleCheckbox")
					-- for i, line in ipairs(lines) do
					-- 	local new_line = line
					-- 	if line:match("^%s*-%s*%[x%]") then
					-- 		new_line = line:gsub("^%s*-%s*%[x%]%s*", "", 1)
					-- 	elseif line:match("^%s*-%s*%[ %]") then
					-- 		new_line = line:gsub("%[ %]", "[x]", 1)
					-- 	elseif line:match("^%s*$") or not line:match("^%s*-%s*") then
					-- 		new_line = "- [ ] " .. line:gsub("^%s*", "")
					-- 	else
					-- 		new_line = line:gsub("^(%s*-)%s*", "%1 [ ] ", 1)
					-- 	end
					-- 	lines[i] = new_line
					-- end
					--
					-- -- Ensure `lines` is a table before setting it back
					-- if type(lines) == "table" then
					-- 	vim.fn.setline(start_line, lines)
					-- else
					-- 	vim.api.nvim_err_writeln("Error: 'lines' is not a table")
					-- end
					--
					-- -- Reset cursor position to the end of the selection
					-- vim.fn.setpos(".", { 0, end_line, 0, 0 })
				end,
				desc = "Toggle Markdown Task (Visual Mode)",
				mode = "v",
			},
		},
	},
}
