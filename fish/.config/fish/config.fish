## This has been added for making sure that ssh-keys are loading into the env
if not set -q SSH_AUTH_SOCK
    eval (ssh-agent -c)
    set -Ux SSH_AUTH_SOCK $SSH_AUTH_SOCK
    set -Ux SSH_AGENT_PID $SSH_AGENT_PID
end

eval (/opt/homebrew/bin/brew shellenv)

starship init fish | source # https://starship.rs/
zoxide init fish | source # 'ajeetdsouza/zoxide'
fnm env --use-on-cd | source # "Schniz/fnm"
# source /opt/homebrew/opt/asdf/libexec/asdf.fish

## Setup Pyenv
# set -Ux PYENV_ROOT $HOME/.pyenv
# fish_add_path $PYENV_ROOT/bin
# set -Ux PIPENV_PYTHON $PYENV_ROOT/shims/python
#
# if command -v pyenv 1>/dev/null 2>&1
#     pyenv init - | source
# end

# bun
set --export BUN_INSTALL "$HOME/.bun"
set --export PATH $BUN_INSTALL/bin $PATH

set fish_greeting ""
set fish_key_bindings fish_vi_key_bindings #set vim keybinding on fish shell

# paths
fish_add_path /bin
fish_add_path ~/.local/bin
fish_add_path ~/scripts
fish_add_path ~/go/bin
fish_add_path ~/.bun/bin
fish_add_path ~/.deno/bin
fish_add_path /opt/homebrew/postgresql@16/bin
fish_add_path /opt/homebrew/opt/llvm/bin
fish_add_path /opt/homebrew/bin/conda
fish_add_path /opt/homebrew/bin/mamba
fish_add_path -U $HOME/Library/Application\ Support/Herd/bin/
fish_add_path -U $ANDROID_HOME/emulator
fish_add_path -U $ANDROID_HOME/platform-tools


# pnpm
set -gx PNPM_HOME /Users/0xaquawolf/Library/pnpm
if not string match -q -- $PNPM_HOME $PATH
    set -gx PATH "$PNPM_HOME" $PATH
end
# pnpm end

# global variables
set -x LS_COLORS (vivid generate catppuccin-mocha)
set -gx TERM xterm-256color
set -Ux EDITOR nvim
set -gx VISUAL nvim
set -gx ESPANSO_CONFIG ~/.config/espanso/
set -Ux MANPAGER "sh -c 'col -bx | bat -l man -p'"
set -gx XDG_CONFIG_HOME ~/.config
set -gx BAT_THEME "Catppuccin Mocha"
set -gx BUN_INSTALL "$HOME/.bun"
set -Ux BASE_PATH "/Users/aquawolf/Library/Mobile Documents/iCloud~md~obsidian/Documents/vaults/SecondBrain"
set -gx LDFLAGS -L/opt/homebrew/opt/llvm/lib
set -gx CPPFLAGS -I/opt/homebrew/opt/llvm/include
set -x JAVA_HOME /Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home
set -gx NVM_DIR "$HOME/.config/nvm"
set -gx ANDROID_HOME "$HOME/Library/Android/sdk"


# FZF Config
set -g FZF_DEFAULT_COMMAND "fd -H -E '.git'"
set -g FZF_PREVIEW_FILE_CMD 'Bat --style=numbers --color=always --line-rage :500'
set -g FZF_LEGACY_KEYBINDINGS 0

# theme
set -g theme_color_scheme "Catppuccin Mocha"

# fish options
set -g fish_prompt_pwd_dir_length 1
set -g theme_display_user yes
set -g theme_hide_hostname no
set -g theme_hostname always

# |====== Aliases  ======|
alias vim nvim
alias c clear
alias e exit

# |====== Utils  ======|
alias sf "fzf | xargs nvim"
alias rm "rm -i"
alias cp "cp -i"
alias mkdir "mkdir -p"
alias hf "history | fzf"
alias pp "string split ':' $PATH | fzf"
alias skv "skhd --stop-service && skhd -V"
alias awi "yabai -m query --windows | fx"
alias yt-mp3 "yt-dlp -x --audio-format mp3 --audio-quality 0"
alias yt-1080p 'yt-dlp -f "bestvideo[height=1080]+bestaudio/best"'

alias .. "cd .."
alias ... "cd ../.."
alias .... "cd ../../.."

# |======  LS  ======|
alias l "eza --icons=always --git"
alias ls "eza --icons=always --git --git-ignore --ignore-glob='node_modules'"
alias lla "ls -la"
alias ll "ls -l"
alias lt "eza -lAh --icons=always --git --tree --level=4 --long --ignore-glob='node_modules|.git' "

# |======  Config App  ======|
alias nrc "vim ~/.config/nvim/lua/"
alias orc "vim $BASE_PATH/.obsidian.vimrc"
alias frc "vim ~/.config/fish/config.fish" # fish shell rc
alias erc "vim ~/.config/espanso/"
alias sfs "source ~/.config/fish/config.fish" # source fish shell
alias nrc "vim ~/.config/nvim/init.lua"
alias arc "vim ~/.alacritty.yml"
alias wrc "vim ~/.config/wezterm/wezterm.lua"
alias skrc "vim ~/.skhdrc"
alias trc "vim ~/.tmux.conf"
alias zelrc "vim ~/.config/zellij/config.kdl"
alias yrc "vim ~/.yabairc"
alias krc "vim ~/AquaFiles/gen-karabiner-config/rules.ts"
alias zshrc "vim ~/.config/.zshrc"

# |======  Applications  ======|
alias gl gorilla
alias btop bpytop
alias nf neofetch
alias ff fastfetch
alias cat bat
alias lg lazygit
alias ct cointop
alias top htop
alias logk "tail -f ~/.local/share/karabiner/log/console_user_server.log"

# |======  zellij  ======|
alias zel "zellij --layout ~/.config/zellij/layouts/dev.kdl"
alias zls "zellij ls"
alias za "zellij attach"

# |======  Github ======|
alias ghrw "gh repo view --web"

# |======  JavaScrip ======|
alias cap "cat package.json"
alias bd "bun dev"
alias bp "bun run build && bun run preview"
alias bb "bun run build"

# |======  Obsidian ======|
alias sb 'cd "$BASE_PATH" && vim .'

# |======  HomeBrew ======|
alias bi "brew install"
alias bs "brew search"
alias bi "brew info"

# |======  python  ======|
alias venv "uv venv && source .venv/bin/activate.fish"
alias plf "uv pip list | fzf" # pip list fzf
alias pfz "uv pip freeze > requirements.txt"

# |======  VS Code  ======|
alias code cursor
# |======  Functions ======|

function mcd
    set dir $argv[1]
    mkdir -p $dir
    cd $dir
end

function unstow_all
    for pkg in */
        stow -D (basename $pkg)
    end
end

function stow_all
    for pkg in */
        stow --adopt (basename $pkg)
    end
end

function toggle_wezterm_font
    set CONFIG_FILE "$HOME/AquaFiles/wezterm/.wezterm.lua"
    set FONT_SIZE_18 18
    set FONT_SIZE_20 20

    # Check if the config file exists
    if test -f $CONFIG_FILE
        # Find the current font size using awk
        set CURRENT_FONT_SIZE (awk -F' = ' '/font_size/ {print $2}' $CONFIG_FILE | tr -d ',')

        # Toggle the font size
        if test "$CURRENT_FONT_SIZE" = "$FONT_SIZE_18"
            set NEW_FONT_SIZE $FONT_SIZE_20
        else if test "$CURRENT_FONT_SIZE" = "$FONT_SIZE_20"
            set NEW_FONT_SIZE $FONT_SIZE_18
        else
            echo "Current font size is not 18 or 20. No changes made"
            return
        end

        # Use sed to replace the current font size with the new font size
        sed -i.bak "s/font_size = $CURRENT_FONT_SIZE/font_size = $NEW_FONT_SIZE/" "$CONFIG_FILE"
        echo "Font size updated from $CURRENT_FONT_SIZE to $NEW_FONT_SIZE in $CONFIG_FILE"
    else
        echo "Configuration file $CONFIG_FILE not found"
    end
end

# Function for intercepting the -h option on most prograjms
function h
    command $argv -h 2>&1 | bat --language=help --style=plain
end

function help
    command $argv --help 2>&1 | bat --language=help --style=plain
end

function where
    for cmd in $argv
        command -s $cmd
        if test $status -eq 0
            command -v $cmd
        else
            echo "$cmd: command not found"
        end
    end
end

function rds # remove DS_STORE
    # Check if argument is provided, otherwise use current directory
    if test -z $argv
        set directory .
    else
        set directory $argv[1]
    end

    # Print message indictating the directory being processed
    echo "Removing .DS_STORE files from $directory"

    # remove .DS_STORE files
    find $directory -type f -name .DS_STORE -exec rm -f {} +

    # print message indicating completion
    echo "ALL .DS_STORE files have been removed from $directory"
end

function secure_delete
    if test (count $argv) -ne 1
        echo "Usage: secure_delete <path_to_file>"
        return 1
    end

    set file_path $argv[1]

    if not test -f $file_path
        echo "Error: File not found: $file_path"
        return 1
    end

    # Use gshred to overwrite the file securely and then delete it
    gshred -v -n 3 -z $file_path

    if test $status -eq 0
        echo "File successfully overwritten and deleted: $file_path"
    else
        echo "Error: Failed to overwrite the file: $file_path"
        return 1
    end
end

function extract_word
    set input_string $argv[1]
    set word (echo $input_string | sed -n 's/^[0-9]*) *"\([^"]*\)"/\1/p')
    echo $word
end

function ff_logo
    set selected_logo (fastfetch --list-logos | fzf)
    set clean_word (extract_word $selected_logo)
    fastfetch --logo $clean_word
end

function yy
    set tmp (mktemp -t "yazi-cwd.XXXXXX")
    yazi $argv --cwd-file="$tmp"
    if set cwd (cat -- "$tmp"); and [ -n "$cwd" ]; and [ "$cwd" != "$PWD" ]
        cd -- "$cwd"
    end
    rm -f -- "$tmp"
end

function crd # create daily jouraal note
    set today_date (date +"%d-%m-%Y")
    set timestamp (date +"%H-%M-%S")
    set base_path "$BASE_PATH/3-Resources/journals/daily"

    if test (count $argv) -gt 0
        set filename "$base_path/$today_date-$argv[1].md"
    else
        set filename "$base_path/$today_date.md"
    end

    echo "# $today_date

## How I'm feeling?:

## Graditude:

## Today's goals:

## Brain Dump:

" >$filename

    echo "Journal entry created: $filename"

    # Open the file in Neovim
    nvim $filename
end

function in
    set base_path "$BASE_PATH/SecondBrain/0-Inbox"

    if test (count $argv) -eq 0
        set file_name ""
    else
        set file_name (string join " " $argv)
    end

    # Prompt for filename if it's empty
    while test -z "$file_name"
        read -P "Enter the name for your new note: " file_name
        if test -z "$file_name"
            echo "Filename cannot be empty. Please try again."
        end
    end

    # Ensure the file name ends with .md
    if not string match -q "*.md" $file_name
        set file_name "$file_name.md"
    end

    # Replace spaces with underscores in the filename
    set safe_file_name (string replace -a " " "-" $file_name)

    set full_path "$base_path/$safe_file_name"

    # Create an empty file
    touch $full_path

    echo "New note created: $full_path"

    # Open the file in Neovim
    nvim $full_path
end

function start-stream
    set base_path "$BASE_PATH/0-Inbox"

    if test (count $argv) -eq 0
        set file_name ""
    else
        set file_name (string join " " $argv)
    end

    # Prompt for filename if it's empty
    while test -z "$file_name"
        read -P "Enter the name for your new note: " file_name
        if test -z "$file_name"
            echo "Filename cannot be empty. Please try again."
        end
    end

    # Ensure the file name ends with .md
    if not string match -q "*.md" $file_name
        set file_name "$file_name.md"
    end

    # Replace spaces with underscores in the filename
    set safe_file_name (string replace -a " " "-" $file_name)

    set full_path "$base_path/$safe_file_name"

    # Create an empty file
    touch $full_path

    echo "New note created: $full_path"

    # Open the file in Neovim
    nvim $full_path
end

function start-stream
    set base_path "$BASE_PATH/3-Resources/youtube-stream"
    set date (date +"%Y-%m-%d")
    set filename "$date-stream-checklist.md"
    set full_path "$base_path/$filename"

    echo "# $date Streaming checklist

- [ ] Create a task list for stream
- [ ] Create a list of things we did last stream
- [ ] Create Title
- [ ] Create Description
- [ ] Create Thumbnail
- [ ] Setup up mic
- [ ] Setup Music Instrumental
- [ ] Setup Atomosphere
- [ ] Test video
- [ ] Speed test
- [ ] Create Broadcast (low latency)
- [ ] Setup Chat Link
- [ ] Go Live
" >$full_path

    echo "Stream checklist created: $full_path"

    # Open the file in Neovim
    nvim $full_path
end

function yt-sum
    set base_path "$BASE_PATH/3-Resources/video-summaries"
    set date (date +"%Y-%m-%d")

    # Prompt for video title and URL
    read -P "Enter the YouTube video title: " video_title
    read -P "Enter the YouTube video URL: " video_url

    # Create filename based on date and video title
    set safe_title (string replace -a " " "-" $video_title | string lower)
    set filename "$date-$safe_title.md"
    set full_path "$base_path/$filename"

    # Create the file with initial content
    echo "# $video_title

Date: $date

URL: $video_url

## Summary
[Paste the video summary here]

## My Thoughts
[Add your thoughts and insights about the video here]

## Key Points
-
-
-

## Action Items
- [ ] 
- [ ] 
- [ ] 

## Related Topics
- 
- 
" >$full_path

    echo "Video summary template created: $full_path"
    # Open the file in Neovim
    nvim $full_path
end

function killport
    if test (count $argv) -eq 0
        echo "Usage: killport <port_number>"
        return 1
    end

    set port $argv[1]
    set pid (lsof -ti :$port)

    if test -z "$pid"
        echo "No process found running on port $port"
        return 1
    else
        kill -9 $pid
        echo "Process $pid running on port $port has been killed"
    end
end

if test -s "$NVM_DIR/nvm.sh"
    function nvm
        bass source "$NVM_DIR/nvm.sh" --no-use ';' nvm $argv
    end
end

# >>> conda initialize >>>
# !! Contents within this block are managed by 'conda init' !!
if test -f /opt/homebrew/Caskroom/miniforge/base/bin/conda
    eval /opt/homebrew/Caskroom/miniforge/base/bin/conda "shell.fish" hook $argv | source
else
    if test -f "/opt/homebrew/Caskroom/miniforge/base/etc/fish/conf.d/conda.fish"
        . "/opt/homebrew/Caskroom/miniforge/base/etc/fish/conf.d/conda.fish"
    else
        set -x PATH /opt/homebrew/Caskroom/miniforge/base/bin $PATH
    end
end
# <<< conda initialize <<<

# Set up Rust environment for Fish
if test -d "$HOME/.cargo"
    set -x PATH "$HOME/.cargo/bin" $PATH
end
