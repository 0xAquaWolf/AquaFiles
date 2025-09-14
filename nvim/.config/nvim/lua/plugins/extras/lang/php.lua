-- user/php.lua
local dap = require("dap")
local mason_registry = pcall(require, "mason-registry") and require("mason-registry") or nil

-- try to resolve the installed php-debug-adapter path (mason)
local adapter_cmd = "node"
local adapter_args = {}
if mason_registry then
  local ok, pkg = pcall(mason_registry.get_package, "php-debug-adapter")
  if ok and pkg and pkg:is_installed() then
    local install_path = pkg:get_install_path()
    adapter_args = { install_path .. "/extension/out/phpDebug.js" }
  else
    -- fallback to global path if not installed by mason; adjust if needed
    adapter_args = { "/usr/local/lib/node_modules/php-debug/out/phpDebug.js" }
  end
else
  adapter_args = { "/usr/local/lib/node_modules/php-debug/out/phpDebug.js" }
end

dap.adapters.php = {
  type = "executable",
  command = adapter_cmd,
  args = adapter_args,
}

dap.configurations.php = {
  {
    name = "Launch current file (php cli)",
    type = "php",
    request = "launch",
    program = "${file}",
    cwd = "${workspaceFolder}",
    runtimeExecutable = "php",
  },
  {
    name = "Listen for Xdebug (webserver)",
    type = "php",
    request = "launch",
    port = 9003, -- match xdebug.client_port
    -- PATH MAPPINGS:
    -- For Valet/Herd (local), if your workspace is the same as the server's docroot,
    -- you can leave pathMappings empty or map server root to workspace:
    pathMappings = {
      -- local Valet example (usually same paths so this is often unnecessary)
      -- ["/Users/youruser/Sites/myproject/public"] = "${workspaceFolder}/public",

      -- Common Docker example:
      -- ["/var/www/html"] = "${workspaceFolder}"
    },
  },
}
