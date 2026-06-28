PATH1="@loader_path"
PATH2="@loader_path/../node_modules/@node-3d/deps-qt-core/bin-osx"
PATH3="@loader_path/../../deps-qt-core/bin-osx"
PATH4="@loader_path/../node_modules/@node-3d/deps-qt-gui/bin-osx"
PATH5="@loader_path/../../deps-qt-gui/bin-osx"

install_name_tool -add_rpath "$PATH1" "$1" \
&& install_name_tool -add_rpath "$PATH2" "$1" \
&& install_name_tool -add_rpath "$PATH3" "$1" \
&& install_name_tool -add_rpath "$PATH4" "$1" \
&& install_name_tool -add_rpath "$PATH5" "$1" \
|| echo "Rpath already present."
