session=$(zellij attach | tail -n +3 | awk -F' ' '{print $1}' | fzf)

echo "$session"

# if [ -n "$session" ]; then
# 	zellij attach "$session"
# else
# 	echo "No session Selected"
# fi
