return {
  -- add symbols-outline
  {
    "shortcuts/no-neck-pain.nvim",
    cmd = "NoNeckPain",
    keys = {
      { "<leader>kp", "<cmd>NoNeckPain<cr>", desc = "[N]o [N]eckpain" },
    },
    opts = {},
    config = function()
      require("no-neck-pain").setup({
        width = 140,
      })
    end,
  },
}
