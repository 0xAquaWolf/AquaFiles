return {}

-- return {
-- 	"mfussenegger/nvim-dap-python",
--   -- stylua: ignore
--   keys = {
--     { "<leader>dPt", function() require('dap-python').test_method() end, desc = "Debug Method", ft = "python" },
--     { "<leader>dPc", function() require('dap-python').test_class() end, desc = "Debug Class", ft = "python" },
--   },
-- 	config = function()
-- 		if vim.fn.has("win32") == 1 then
-- 			require("dap-python").setup(LazyVim.get_pkg_path("debugpy", "/venv/Scripts/pythonw.exe"))
-- 		else
-- 			require("dap-python").setup(LazyVim.get_pkg_path("debugpy", "/venv/bin/python"))
-- 		end
-- 	end,
-- }
