PATH1="@loader_path"
PATH2="@loader_path/../node_modules/deps-qt-core-raub/bin-osx"
PATH3="@loader_path/../../deps-qt-core-raub/bin-osx"
PATH4="@loader_path/../node_modules/deps-qt-gui-raub/bin-osx"
PATH5="@loader_path/../../deps-qt-gui-raub/bin-osx"

install_name_tool -add_rpath "$PATH1" "libqcocoa.dylib" \
&& install_name_tool -add_rpath "$PATH2" "libqcocoa.dylib" \
&& install_name_tool -add_rpath "$PATH3" "libqcocoa.dylib" \
&& install_name_tool -add_rpath "$PATH4" "libqcocoa.dylib" \
&& install_name_tool -add_rpath "$PATH5" "libqcocoa.dylib" \
|| echo "Rpath already present."
