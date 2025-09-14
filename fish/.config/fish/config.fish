#!/usr/bin/env fish

# =============================================================================
# SSH AGENT SETUP
# =============================================================================
if not set -q SSH_AUTH_SOCK
    eval (ssh-agent -c)
    set -Ux SSH_AUTH_SOCK $SSH_AUTH_SOCK
    set -Ux SSH_AGENT_PID $SSH_AGENT_PID
end
ssh-add ~/.ssh/0xaquawolf

# =============================================================================
# ENVIRONMENT INITIALIZATION
# =============================================================================
# Homebrew
eval (/opt/homebrew/bin/brew shellenv)

# Shell enhancements
starship init fish | source # https://starship.rs/
zoxide init fish | source # 'ajeetdsouza/zoxide'

# =============================================================================
# FISH SHELL CONFIGURATION
# =============================================================================
set fish_greeting ""
set fish_key_bindings fish_vi_key_bindings
set -g fish_prompt_pwd_dir_length 1
set -g theme_display_user yes
set -g theme_hide_hostname no
set -g theme_hostname always
set -g theme_color_scheme "Catppuccin Mocha"

# =============================================================================
# PATH CONFIGURATION
# =============================================================================
# Basic paths
fish_add_path /bin
fish_add_path ~/.local/bin
fish_add_path ~/scripts

# Programming languages and tools
fish_add_path ~/go/bin
fish_add_path ~/.bun/bin
fish_add_path ~/.deno/bin
fish_add_path ~/.cargo/bin

# Development tools
fish_add_path /opt/homebrew/postgresql@16/bin
fish_add_path /opt/homebrew/opt/llvm/bin
fish_add_path /opt/homebrew/bin/conda
fish_add_path /opt/homebrew/bin/mamba

# Application-specific paths
fish_add_path -U $HOME/Library/Application\ Support/Herd/bin/
fish_add_path -U $ANDROID_HOME/emulator
fish_add_path -U $ANDROID_HOME/platform-tools
fish_add_path -U $HOME/.config/composer/vendor/bin
fish_add_path /Users/0xaquawolf/.codeium/windsurf/bin
fish_add_path /Users/0xaquawolf/.lmstudio/bin

# Herd Lite PHP environment
# set -gx PATH "/Users/0xaquawolf/.config/herd-lite/bin" $PATH

# PNPM setup
set -gx PNPM_HOME /Users/0xaquawolf/Library/pnpm
if not string match -q -- $PNPM_HOME $PATH
    set -gx PATH "$PNPM_HOME" $PATH
end

# =============================================================================
# ENVIRONMENT VARIABLES
# =============================================================================
# Terminal and editor
set -gx TERM xterm-256color
set -Ux EDITOR nvim
set -gx VISUAL nvim
set -gx XDG_CONFIG_HOME ~/.config

# Colors and themes
set -x LS_COLORS (vivid generate catppuccin-mocha)
set -gx BAT_THEME "Catppuccin Mocha"

# Application configs
set -gx ESPANSO_CONFIG ~/.config/espanso/
set -Ux MANPAGER "sh -c 'col -bx | bat -l man -p'"
set -Ux BASE_PATH "/Users/aquawolf/Library/Mobile Documents/iCloud~md~obsidian/Documents/vaults/SecondBrain"

# Development environments
set -gx BUN_INSTALL "$HOME/.bun"
set -x JAVA_HOME /Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home
set -gx NVM_DIR (brew --prefix nvm)
set -gx ANDROID_HOME "$HOME/Library/Android/sdk"
set -Ux CONDA_SUBDIR osx-arm64
set -U nvm_default_version 22.11

# Build flags
set -gx LDFLAGS -L/opt/homebrew/opt/llvm/lib
set -gx CPPFLAGS -I/opt/homebrew/opt/llvm/include
set -x C_INCLUDE_PATH $HOME/.local/share/nvm/v22.11.0/include/node $C_INCLUDE_PATH

# PHP environment
# set -gx PHP_INI_SCAN_DIR "/Users/0xaquawolf/.config/herd-lite/bin:$PHP_INI_SCAN_DIR"

# =============================================================================
# FZF CONFIGURATION
# =============================================================================
set -g FZF_DEFAULT_COMMAND "fd -H -E '.git'"
set -g FZF_PREVIEW_FILE_CMD 'bat --style=numbers --color=always --line-range :500'
set -g FZF_LEGACY_KEYBINDINGS 0

# =============================================================================
# ALIASES - BASIC COMMANDS
# =============================================================================
alias vim nvim
alias c clear
alias e exit
alias cat bat
alias top htop
alias pa "php artisan"
alias va valet

# Navigation
alias .. "cd .."
alias ... "cd ../.."
alias .... "cd ../../.."

# File operations
alias rm "rm -i"
alias cp "cp -i"
alias mkdir "mkdir -p"

# =============================================================================
# ALIASES - UTILITIES
# =============================================================================
alias sf "fzf | xargs nvim"
alias hf "history | fzf"
alias pp "string split ':' $PATH | fzf"
alias btop bpytop

# System management
alias skv "skhd --stop-service && skhd -V"
alias awi "yabai -m query --windows | fx"
alias logk "tail -f ~/.local/share/karabiner/log/console_user_server.log"

# =============================================================================
# ALIASES - FILE LISTING (EZA)
# =============================================================================
alias l "eza --icons=always --git"
alias ls "eza --icons=always --git --git-ignore --ignore-glob='node_modules'"
alias lla "ls -la"
alias ll "ls -l"
alias lt "eza -lAh --icons=always --git --tree --level=4 --long --ignore-glob='node_modules|.git'"

# =============================================================================
# ALIASES - CONFIGURATION FILES
# =============================================================================
alias frc "vim ~/.config/fish/config.fish"
alias sfs "source ~/.config/fish/config.fish"
alias nrc "vim ~/.config/nvim/init.lua"
alias orc "vim $BASE_PATH/.obsidian.vimrc"
alias erc "vim ~/.config/espanso/"
alias arc "vim ~/.alacritty.yml"
alias wrc "vim ~/.config/wezterm/wezterm.lua"
alias skrc "vim ~/.skhdrc"
alias trc "vim ~/.tmux.conf"
alias zelrc "vim ~/.config/zellij/config.kdl"
alias yrc "vim ~/.yabairc"
alias krc "vim ~/AquaFiles/gen-karabiner-config/rules.ts"
alias grc "vim ~/AquaFiles/ghostty/.config/ghostty/config"
alias zshrc "vim ~/.config/.zshrc"

# =============================================================================
# ALIASES - APPLICATIONS
# =============================================================================
alias gl gorilla
alias nf neofetch
alias ff fastfetch
alias lg lazygit
alias ct cointop
alias surf windsurf

# =============================================================================
# ALIASES - ZELLIJ
# =============================================================================
alias zel "zellij --layout ~/.config/zellij/layouts/dev.kdl"
alias zls "zellij ls"
alias za "zellij attach"

# =============================================================================
# ALIASES - GITHUB
# =============================================================================
alias ghrw "gh repo view --web"

# =============================================================================
# ALIASES - JAVASCRIPT/NODE
# =============================================================================
alias cap "cat package.json"
alias bd "bun dev"
alias bp "bun run build && bun run preview"
alias bb "bun run build"

# =============================================================================
# ALIASES - OBSIDIAN
# =============================================================================
alias sb 'cd "$BASE_PATH" && vim .'

# =============================================================================
# ALIASES - HOMEBREW
# =============================================================================
alias bi "brew install"
alias bs "brew search"
alias binfo "brew info"

# =============================================================================
# ALIASES - PYTHON
# =============================================================================
alias plf "pip list | fzf"
alias clf "conda list | fzf"
alias pfz "pip freeze > requirements.txt"
alias zelalgo "conda activate algo-trading && zellij --layout ~/Projects/algo-trading/moondev-bootcamp/code/day-2/data-streams/crypto-data-streams.kdl"

# =============================================================================
# ALIASES - MEDIA/DOWNLOADS
# =============================================================================
alias yt-mp3 "yt-dlp -x --audio-format mp3 --audio-quality 0 --no-playlist"
alias dlbeat "cd ~/Music/yt-dls/instrumentals/ && yt-dlp -x --audio-format mp3 --audio-quality 0"
alias yt-1080p 'yt-dlp -f "bestvideo[height=1080]+bestaudio/best" --merge-output-format mp4'

# =============================================================================
# ALIASES - PROJECT CREATION
# =============================================================================
alias create-evm-fish 'fish ~/scripts/create-evm-project.fish'
alias create-evm 'sh ~/scripts/create-evm-project.sh'

# =============================================================================
# FUNCTIONS - SYSTEM UTILITIES
# =============================================================================
function mcd --description "Create directory and change into it"
    set dir $argv[1]
    mkdir -p $dir
    cd $dir
end

function killport --description "Kill process running on specified port"
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

function where --description "Show location of command"
    for cmd in $argv
        command -s $cmd
        if test $status -eq 0
            command -v $cmd
        else
            echo "$cmd: command not found"
        end
    end
end

function h --description "Show help with bat highlighting"
    command $argv -h 2>&1 | bat --language=help --style=plain
end

function help --description "Show help with bat highlighting"
    command $argv --help 2>&1 | bat --language=help --style=plain
end

# =============================================================================
# FUNCTIONS - FILE MANAGEMENT
# =============================================================================
function rds --description "Remove .DS_STORE files recursively"
    if test -z $argv
        set directory .
    else
        set directory $argv[1]
    end

    echo "Removing .DS_STORE files from $directory"
    find $directory -type f -name .DS_STORE -exec rm -f {} +
    echo "ALL .DS_STORE files have been removed from $directory"
end

function secure_delete --description "Securely delete file using gshred"
    if test (count $argv) -ne 1
        echo "Usage: secure_delete <path_to_file>"
        return 1
    end

    set file_path $argv[1]

    if not test -f $file_path
        echo "Error: File not found: $file_path"
        return 1
    end

    gshred -v -n 3 -z $file_path

    if test $status -eq 0
        echo "File successfully overwritten and deleted: $file_path"
    else
        echo "Error: Failed to overwrite the file: $file_path"
        return 1
    end
end

function yy --description "Yazi with directory change support"
    set tmp (mktemp -t "yazi-cwd.XXXXXX")
    yazi $argv --cwd-file="$tmp"
    if set cwd (cat -- "$tmp"); and [ -n "$cwd" ]; and [ "$cwd" != "$PWD" ]
        cd -- "$cwd"
    end
    rm -f -- "$tmp"
end

# =============================================================================
# FUNCTIONS -  AI Management
# =============================================================================
function glm --description "Update claude code with GLM"
    export ANTHROPIC_AUTH_TOKEN=12d112bf8976484caffdc3716c211afb.bz7Xtm9DumCEaMve
    export ANTHROPIC_BASE_URL=https://api.z.ai/api/anthropic
    claude
end

# =============================================================================
# FUNCTIONS - STOW MANAGEMENT
# =============================================================================
function unstow_all --description "Unstow all packages in current directory"
    for pkg in */
        stow -D (basename $pkg)
    end
end

function stow_all --description "Stow all packages in current directory"
    for pkg in */
        stow --adopt (basename $pkg)
    end
end

# =============================================================================
# FUNCTIONS - MEDIA PROCESSING
# =============================================================================
function heic2jpg --description "Convert HEIC images to JPEG format"
    if not command -sq sips
        echo "Error: sips command not found. This function requires macOS."
        return 1
    end

    if test (count $argv) -eq 0
        echo "Usage: heic2jpg <file.HEIC> [more files...]"
        return 1
    end

    for file in $argv
        if not test -f $file
            echo "Error: File '$file' not found"
            continue
        end

        if not string match -q -i "*.HEIC" $file
            echo "Error: '$file' is not a HEIC file"
            continue
        end

        set output_file (string replace -i '.HEIC' '.jpg' $file)
        sips -s format jpeg $file --out $output_file

        if test $status -eq 0
            echo "Successfully converted '$file' to '$output_file'"
        else
            echo "Error converting '$file'"
        end
    end
end

function ytmp3 --description "Download YouTube video as MP3 using yt-dlp"
    if test (count $argv) -eq 0
        echo "Please provide a YouTube URL"
        return 1
    end

    if not command -v yt-dlp >/dev/null
        echo "yt-dlp is not installed. Please install it first:"
        echo "brew install yt-dlp    # For macOS"
        return 1
    end

    if not command -v ffmpeg >/dev/null
        echo "ffmpeg is not installed. Please install it first:"
        echo "brew install ffmpeg    # For macOS"
        return 1
    end

    yt-dlp \
        --extract-audio \
        --audio-format mp3 \
        --audio-quality 0 \
        --output "%(title)s.%(ext)s" \
        --embed-thumbnail \
        --add-metadata \
        $argv[1]
end

function extract_frames --description "Extract frames from video file"
    if test (count $argv) -lt 1
        echo "Usage: extract_frames <video_file> [fps]"
        return 1
    end

    set -l input $argv[1]
    set -l fps 1

    if test (count $argv) -ge 2
        set fps $argv[2]
    end

    set -l name (basename $input .mkv)
    set -l outdir frames/$name

    mkdir -p $outdir
    ffmpeg -i $input -vf "fps=$fps" -q:v 1 $outdir/frame_%04d.png
    echo "✅ Frames saved to: $outdir"
end

function create_pdf --description "Create PDF from images in current directory"
    set source_folder (pwd)
    set output_pdf "final.pdf"

    if test (count $argv) -ge 1
        set output_pdf $argv[1]
    end

    set temp_file (mktemp)

    echo "Gathering image files from $source_folder..."
    find $source_folder -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' \) | sort >$temp_file

    if test (wc -l < $temp_file) -eq 0
        echo "No image files found in $source_folder!"
        rm $temp_file
        return 1
    end

    echo "Creating PDF at $output_pdf..."
    magick convert @$temp_file $output_pdf
    rm $temp_file
    echo "PDF created successfully: $output_pdf"
end

# =============================================================================
# FUNCTIONS - TEXT PROCESSING
# =============================================================================
function slugtitle --description "Slugify clipboard/args/stdin to dashed lowercase"
    set -l input

    if test (count $argv) -gt 0
        set input (string join " " -- $argv)
    else if not isatty stdin
        set input (cat)
    else
        if type -q pbpaste
            set input (pbpaste)
        else if type -q xclip
            set input (xclip -o -selection clipboard)
        else if type -q xsel
            set input (xsel --clipboard --output)
        else
            set input ""
        end
    end

    if type -q iconv
        set input (printf '%s' "$input" | iconv -f UTF-8 -t ASCII//TRANSLIT 2>/dev/null)
    end

    set -l slug (string lower -- "$input")
    set slug (string replace -r -a '[^a-z0-9]+' '-' -- "$slug")
    set slug (string trim -c '-' -- "$slug")

    echo "$slug"
end

function extract_word --description "Extract word from formatted string"
    set input_string $argv[1]
    set word (echo $input_string | sed -n 's/^[0-9]*) *"\([^"]*\)"/\1/p')
    echo $word
end

# =============================================================================
# FUNCTIONS - DEVELOPMENT TOOLS
# =============================================================================
function dkrs --description "Restart Docker Compose service"
    if test -z $argv[1]
        echo "Usage: dkrs <service_name>"
        return 1
    end

    set service $argv[1]
    echo "Restarting $service..."
    docker-compose down -v
    docker-compose rm -f $service
    docker-compose -p n8n-local up -d
end

function ghinit --description "Initialize GitHub repository"
    if test (count $argv) -ne 1
        echo "Usage: ghinit REPO_NAME"
        return 1
    end

    set -l repo_name $argv[1]
    set -l github_username (git config user.name)

    git init
    gh repo create --private $repo_name
    git remote add origin git@github.com:$github_username/$repo_name.git
    git add .
    git commit -m "Initial commit"
    git push -u origin main
end

function toggle_wezterm_font --description "Toggle WezTerm font size between 18 and 20"
    set CONFIG_FILE "$HOME/AquaFiles/wezterm/.wezterm.lua"
    set FONT_SIZE_18 18
    set FONT_SIZE_20 20

    if test -f $CONFIG_FILE
        set CURRENT_FONT_SIZE (awk -F' = ' '/font_size/ {print $2}' $CONFIG_FILE | tr -d ',')

        if test "$CURRENT_FONT_SIZE" = "$FONT_SIZE_18"
            set NEW_FONT_SIZE $FONT_SIZE_20
        else if test "$CURRENT_FONT_SIZE" = "$FONT_SIZE_20"
            set NEW_FONT_SIZE $FONT_SIZE_18
        else
            echo "Current font size is not 18 or 20. No changes made"
            return
        end

        sed -i.bak "s/font_size = $CURRENT_FONT_SIZE/font_size = $NEW_FONT_SIZE/" "$CONFIG_FILE"
        echo "Font size updated from $CURRENT_FONT_SIZE to $NEW_FONT_SIZE in $CONFIG_FILE"
    else
        echo "Configuration file $CONFIG_FILE not found"
    end
end

# =============================================================================
# LANGUAGE ENVIRONMENT SETUP
# =============================================================================
# Deno environment
if test -d "$HOME/.deno"
    set -gx DENO_INSTALL "$HOME/.deno"
    if not contains "$DENO_INSTALL/bin" $PATH
        set -gx PATH "$DENO_INSTALL/bin" $PATH
    end
end
# Rust/Cargo environment
if test -d "$HOME/.cargo"
    if test -f "$HOME/.cargo/env"
        source "$HOME/.cargo/env"
    end
end

# Conda initialization
set -l conda_base /opt/homebrew/Caskroom/miniforge/base

if test -f "$conda_base/bin/conda"
    eval "$conda_base/bin/conda" "shell.fish" hook $argv | source
else if test -f "$conda_base/etc/fish/conf.d/conda.fish"
    source "$conda_base/etc/fish/conf.d/conda.fish"
else
    if not contains "$conda_base/bin" $PATH
        set -gx PATH "$conda_base/bin" $PATH
    end

    for conda_path in /opt/homebrew/bin/conda /usr/local/bin/conda ~/miniconda3/bin/conda ~/anaconda3/bin/conda
        if test -f "$conda_path"
            eval "$conda_path" "shell.fish" hook $argv | source
            break
        end
    end
end

# =============================================================================
# STARTUP
# =============================================================================
clear
