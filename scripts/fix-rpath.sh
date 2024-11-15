PATH1="@loader_path"
PATH2="@loader_path/../node_modules/deps-qt-core-raub/bin-osx"
PATH3="@loader_path/../../deps-qt-core-raub/bin-osx"
PATH4="@loader_path/../node_modules/deps-qt-gui-raub/bin-osx"
PATH5="@loader_path/../../deps-qt-gui-raub/bin-osx"

install_name_tool -add_rpath "$PATH1" "$1" \
&& install_name_tool -add_rpath "$PATH2" "$1" \
&& install_name_tool -add_rpath "$PATH3" "$1" \
&& install_name_tool -add_rpath "$PATH4" "$1" \
&& install_name_tool -add_rpath "$PATH5" "$1" \
|| echo "Rpath already present."
