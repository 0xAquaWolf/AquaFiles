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
				path = "/Users/0xaquawolf/Library/Mobile Documents/iCloud~md~obsidian/Documents/NeoDocs/SecondBrain",
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
				prompt_title = "Select Inbox Folder",
				cwd = vim.g.obsidian_vault_path,
				hidden = true,
				find_command = { "find", ".", "-type", "d" },
				attach_mappings = function(_, map)
					map("i", "<CR>", function(prompt_bufnr)
						local current_picker = require("telescope.actions.state").get_current_picker(prompt_bufnr)
						local selected_entry = current_picker:get_selection()
						local selected_path = selected_entry.path or selected_entry.value
						require("telescope.actions").close(prompt_bufnr)

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

		require("obsidian").setup({
			workspaces = opts.workspaces,
			follow_url_func = function(url) -- TODO: test this out
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
