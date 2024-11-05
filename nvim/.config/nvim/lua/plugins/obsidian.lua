return {
	"epwalsh/obsidian.nvim",
	version = "*", -- recommended, use latest release instead of latest eommit
	lazy = true,
	ft = "markdown",
	dependencies = {
		"nvim-lua/plenary.nvim",
		"nvim-telescope/telescope.nvim",
	},
	opts = {
		workspaces = {
			{
				name = "secondBrain",
				path = "/Users/0xaquawolf/Library/Mobile Documents/iCloud~md~obsidian/Documents/SecondBrain/",
			},
		},
	},
	config = function(_, opts)
		-- Function to create and open a new markdown file
		local function create_and_open_md_file()
			-- Use telescope to pick a folder within the vault
			if vim.bo.filetype ~= "markdown" then
				vim.notify("Not in a markdown file", vim.log.levels.WARN)
				return
			end

			local current_file = vim.fn.expand("%:p")
			local in_vault = false
			for _, workspace in ipairs(opts.workspaces) do
				if string.find(current_file, workspace.path, 1, true) then
					in_vault = true
					break
				end
			end

			if not in_vault then
				vim.notify("Not in an Obsidian vault", vim.log.levels.WARN)
				return
			end

			require("telescope.builtin").find_files({
				previewer = false,
				prompt_title = "Select Folder",
				cwd = vim.g.obsidian_vault_path,
				hidden = true,
				-- Using ripgrep (rg) to list directories two levels deep, excluding hidden directories and .git
				find_command = {
					"find",
					".",
					"-maxdepth",
					"1",
					"-mindepth",
					"1",
					"!",
					"-path",
					"./.*",
					"!",
					"-path",
					"./.git*",
					"!",
					"-path",
					"./99-Attachments",
					"-type",
					"d",
					"-exec",
					"basename",
					"{}",
					";",
				},
				attach_mappings = function(_, map)
					map("i", "<CR>", function(prompt_bufnr)
						local current_picker = require("telescope.actions.state").get_current_picker(prompt_bufnr)
						local selected_entry = current_picker:get_selection()
						local selected_path = selected_entry.path or selected_entry.value
						require("telescope.actions").close(prompt_bufnr)
						vim.api.nvim_feedkeys("i", "n", true)
						-- Ask user for the name of the file
						vim.ui.input({ prompt = "Enter file name: " }, function(input)
							if input then
								-- Ensure the file has a .md extension
								if not input:match("%.md$") then
									input = input .. ".md"
								end

								-- Full path of the new file
								local new_file_path = selected_path .. "/" .. input

								-- Create the file and open it
								local file = io.open(new_file_path, "w")
								if file then
									file:close()
									vim.cmd("edit " .. new_file_path)
								else
									print("Error creating file: " .. new_file_path)
								end
							end
						end)
					end)
					return true
				end,
			})
		end

		vim.api.nvim_create_user_command("CreateObsidianFile", create_and_open_md_file, {})

		local function rename_obsidian_file()
			-- Check if the current buffer is a markdown file
			if vim.bo.filetype ~= "markdown" then
				vim.notify("Not in a markdown file", vim.log.levels.WARN)
				return
			end

			-- Get the full path of the current file
			local current_file = vim.fn.expand("%:p")

			-- Check if the file is in an Obsidian vault based on your workspaces configuration
			local in_vault = false
			for _, workspace in ipairs(opts.workspaces) do
				if string.find(current_file, workspace.path, 1, true) then
					in_vault = true
					break
				end
			end

			-- If not in an Obsidian vault, notify and return
			if not in_vault then
				vim.notify("Not in an Obsidian vault", vim.log.levels.WARN)
				return
			end

			vim.api.nvim_feedkeys("i", "n", true)
			vim.ui.input({ prompt = "Enter new file name: " }, function(input)
				if input then
					-- Ensure the file has a .md extension
					if not input:match("%.md$") then
						input = input .. ".md"
					end

					-- Full path of the new file
					local new_file_path = vim.fn.expand("%:p:h") .. "/" .. input

					-- Check if the user entered a valid file name
					if input == "" then
						vim.notify("Invalid or empty file name", vim.log.levels.ERROR)
						return
					end

					-- Rename the file
					local success, err = os.rename(current_file, new_file_path)
					if not success then
						vim.notify("Failed to rename file: " .. err, vim.log.levels.ERROR)
						return
					end

					-- Open the newly renamed file for editing
					vim.cmd("edit " .. new_file_path)

					-- Close the buffer of the old file without deleting the file
					vim.cmd("bd! " .. vim.fn.fnameescape(current_file))
					-- Notify and print success message
					vim.notify("File renamed successfully to " .. input)
				end
			end)
		end

		vim.api.nvim_create_user_command("RenameObsidianFile", rename_obsidian_file, {})

		local function delete_current_file()
			-- Get the full path of the current file
			local current_file = vim.fn.expand("%:p")
			-- Get just the file name without the directory
			local file_name = vim.fn.fnamemodify(current_file, ":t")

			-- Check if the file exists
			if vim.fn.filereadable(current_file) ~= 1 then
				vim.notify("File does not exist or is not readable", vim.log.levels.ERROR)
				return
			end

			-- Prompt for confirmation before deleting
			vim.fn.inputsave()
			local confirm = vim.fn.input("Delete file " .. file_name .. "? (y/n): ")
			vim.fn.inputrestore()

			if confirm ~= "y" and confirm ~= "Y" then
				vim.notify("File deletion canceled", vim.log.levels.INFO)
				return
			end

			-- Attempt to delete the file
			local success, err = os.remove(current_file)
			if not success then
				vim.notify("Failed to delete file: " .. err, vim.log.levels.ERROR)
				return
			end

			-- Close the buffer associated with the deleted file
			vim.cmd("bd! " .. vim.fn.fnameescape(current_file))

			-- Notify and print success message
			vim.notify("File deleted successfully: " .. file_name)
		end

		vim.api.nvim_create_user_command("DeleteObsidianFile", delete_current_file, {})

		local function move_current_file()
			-- Get the full path of the current file
			local current_file = vim.fn.expand("%:p")
			-- Check if the file exists
			if vim.fn.filereadable(current_file) ~= 1 then
				vim.notify("File does not exist or is not readable", vim.log.levels.ERROR)
				return
			end

			-- Use vim.fn.systemlist to run the ripgrep command
			local command = "eza -d */ | grep -Ev '^(99-Attachments)' | sed 's#/$##'"
			local directories = vim.fn.systemlist(command)

			require("telescope.pickers")
				.new({}, {
					prompt_title = "Move file to directory",
					finder = require("telescope.finders").new_table({
						results = directories,
						entry_maker = function(entry)
							return {
								value = entry,
								display = vim.fn.fnamemodify(entry, ":~:."),
								ordinal = entry,
							}
						end,
					}),
					sorter = require("telescope.config").values.generic_sorter({}),
					attach_mappings = function(prompt_bufnr, map)
						local actions = require("telescope.actions")
						actions.select_default:replace(function()
							actions.close(prompt_bufnr)
							local selection = require("telescope.actions.state").get_selected_entry()
							local new_dir = selection.value

							-- Ensure the new directory ends with a slash
							if not new_dir:match("[/\\]$") then
								new_dir = new_dir .. "/"
							end

							-- Construct the new file path
							local file_name = vim.fn.fnamemodify(current_file, ":t")
							local new_file_path = new_dir .. file_name

							-- Attempt to move the file
							local success, err = os.rename(current_file, new_file_path)
							if not success then
								vim.notify("Failed to move file: " .. err, vim.log.levels.ERROR)
								return
							end

							-- Close the buffer associated with the moved file
							vim.cmd("bd! " .. vim.fn.fnameescape(current_file))
							local short_path = new_dir .. file_name
							-- Notify and print success message
							vim.notify("File moved successfully to: " .. short_path)

							-- Open the moved file for editing
							vim.cmd("edit " .. new_file_path)
						end)
						return true
					end,
				})
				:find()
		end

		vim.api.nvim_create_user_command("MoveObsidianFile", move_current_file, {})

		require("obsidian").setup({
			workspaces = opts.workspaces,
			follow_url_func = function(url)
				vim.fn.jobstart({ "open", url })
			end,
			attachments = {
				img_folder = "assets",
				img_text_func = function(client, path)
					path = client:vault_relative_path(path) or path
					return string.format("![%s](%s)", path.name, path)
				end,
			},
			completion = {
				nvim_cmp = true,
				min_chars = 2,
			},
			ui = {
				checkboxes = {
					[" "] = { char = "󰄱", hl_group = "ObsidianTodo" },
					["x"] = { char = "", hl_group = "ObsidianDone" },
				},
			},
			mappings = {
				["<cr>"] = {
					action = function()
						return nil
					end,
				},
			},
		})
	end,
}
