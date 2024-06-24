-- https://github.com/lukas-reineke/headlines.nvim
-- This already comes installed with lazyvim but I modify the heading colors and
-- also the lines above and below
-- It also adds these { "◉", "○", "✸", "✿" } symbols in headings

return {
	"lukas-reineke/headlines.nvim",
	dependencies = "nvim-treesitter/nvim-treesitter",
	config = function()
		-- Define custom highlight groups using Vimscript
		vim.cmd([[highlight Headline1 guibg=#b4befe guifg=#313244]])
		vim.cmd([[highlight Headline2 guibg=#74c7ec guifg=#313244]])
		vim.cmd([[highlight Headline3 guibg=#94e2d5 guifg=#313244]])
		vim.cmd([[highlight Headline4 guibg=#f9e2af guifg=#313244]])
		vim.cmd([[highlight Headline5 guibg=#eba0ac guifg=#313244]])
		vim.cmd([[highlight Headline6 guibg=#cba6f7 guifg=#313244]])
		-- Defines the codeblock background color to something darker
		vim.cmd([[highlight CodeBlock guibg=#9399b244]])
		-- When you add a line of dashes with --- this specifies the color, I'm not
		-- adding a "guibg" but you can do so if you want to add a background color
		vim.cmd([[highlight Dash guifg=white gui=bold]])

		-- Setup headlines.nvim with the newly defined highlight groups
		require("headlines").setup({
			markdown = {
				-- If set to false, headlines will be a single line and there will be no
				-- "fat_headline_upper_string" and no "fat_headline_lower_string"
				fat_headlines = true,
				--
				-- Lines added above and below the header line makes it look thicker
				-- "lower half block" unicode symbol hex:2584
				-- "upper half block" unicode symbol hex:2580
				fat_headline_upper_string = "▄",
				fat_headline_lower_string = "▀",
				--
				-- You could add a full block if you really like it thick ;)
				-- fat_headline_upper_string = "█",
				-- fat_headline_lower_string = "█",
				--
				-- Other set of lower and upper symbols to try
				-- fat_headline_upper_string = "▃",
				-- fat_headline_lower_string = "-",
				--
				headline_highlights = {
					"Headline1",
					"Headline2",
					"Headline3",
					"Headline4",
					"Headline5",
					"Headline6",
				},
			},
		})
	end,
}
