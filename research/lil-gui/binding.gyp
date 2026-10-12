{
  'targets': [{
    'target_name': 'node3d_lil_gui_research',
    'sources': [
      'src/bindings.cpp',
      'src/controls.cpp',
      'src/game-ui.cpp',
      'vendor/imgui/imgui.cpp',
      'vendor/imgui/imgui_draw.cpp',
      'vendor/imgui/imgui_tables.cpp',
      'vendor/imgui/imgui_widgets.cpp',
      'vendor/imgui/backends/imgui_impl_glfw.cpp',
      'vendor/imgui/backends/imgui_impl_opengl3.cpp',
    ],
    'include_dirs': [
      '<!@(node -p "require(\'node-addon-api\').include")',
      'vendor/imgui',
      'vendor/imgui/backends',
      '<!(node -p "require(\'@node-3d/deps-opengl\').include")',
    ],
    'defines': ['NAPI_DISABLE_CPP_EXCEPTIONS', 'UNICODE', '_UNICODE'],
    'conditions': [
      ['OS=="win"', {
        'libraries': [
          '<!(node -p "require(\'@node-3d/deps-opengl\').bin")/glfw3dll.lib',
          'opengl32.lib',
        ],
      }],
      ['OS=="linux"', {
        'cflags_cc': ['-std=c++17'],
        'libraries': ['-lGL', '-lglfw'],
      }],
      ['OS=="mac"', {
        'xcode_settings': {'CLANG_CXX_LANGUAGE_STANDARD': 'c++17'},
        'libraries': ['-framework OpenGL', '-framework Cocoa', '-lglfw'],
        'defines': ['GL_SILENCE_DEPRECATION'],
      }],
    ],
  }],
}
