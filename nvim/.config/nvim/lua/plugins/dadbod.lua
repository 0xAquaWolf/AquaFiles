return {
  {
    "tpope/vim-dadbod",
    lazy = true,
    cmd = { "DBUI", "DBUIToggle", "DBUIFindBuffer", "DBUIRenameBuffer", "DBUILastQueryInfo" },
    init = function()
      vim.g.dbs = {
        learning = "mysql://root:Wisdomlistesn5%@localhost:3306/learning_sql",
      }
    end,
  },
}
