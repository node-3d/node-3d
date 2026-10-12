#include "controls.hpp"
#include "game-ui.hpp"

#include <string>
#include <vector>
#include <algorithm>
#include <cmath>
#include <cstring>
#include <cstdint>
#include <unordered_map>

#include <GLFW/glfw3.h>
#include "imgui.h"
#include "imgui_impl_glfw.h"
#include "imgui_impl_opengl3.h"

namespace research {
namespace {

struct Control {
  int id = 0;
  int parent = -1;
  std::string kind;
  std::string label;
  double min = 0;
  double max = 0;
  bool has_min = false;
  bool has_max = false;
  double step = 0;
  int decimals = -1;
  bool hidden = false;
  bool disabled = false;
  bool closed = false;
  std::vector<std::string> options;
};

struct Change {
  int id;
  double value;
  bool finished;
  bool changed = true;
  std::vector<double> color;
  std::string text;
  bool has_text = false;
  bool folder_toggle = false;
};

GLFWwindow* active_window = nullptr;
ImGuiContext* active_context = nullptr;
double previous_frame_time = 0;
std::vector<Control> controls;
std::vector<Change> changes;
// Programmatic open/close updates must not override a user's toggle every frame.
std::unordered_map<int, bool> panel_closed_state;
std::unordered_map<uint64_t, bool> folder_closed_state;
std::string panel_title = "Controls";
int panel_id = 0;
int panel_x = 15;
bool panel_hidden = false;
bool panel_closed = false;
int panel_width = 400;
int panel_height = 0;

Napi::Value Fail(Napi::Env env, const char* message) {
  Napi::Error::New(env, message).ThrowAsJavaScriptException();
  return env.Undefined();
}

void SetContext() {
  ImGui::SetCurrentContext(active_context);
}

void DrawChildren(int parent, Napi::Array frame_values) {
  for (const Control& control : controls) {
    if (control.parent != parent) continue;
    if (control.kind == "deleted" || control.hidden) continue;
    ImGui::PushID(control.id);
    if (control.disabled) ImGui::BeginDisabled();
    if (control.kind == "folder") {
      const uint64_t key = (static_cast<uint64_t>(static_cast<uint32_t>(panel_id)) << 32) |
        static_cast<uint32_t>(control.id);
      auto known = folder_closed_state.find(key);
      if (known == folder_closed_state.end() || known->second != control.closed) {
        ImGui::SetNextItemOpen(!control.closed, ImGuiCond_Always);
      }
      const bool open = ImGui::CollapsingHeader(control.label.c_str());
      folder_closed_state[key] = !open;
      if (open == control.closed) {
        Change change{control.id, open ? 1.0 : 0.0, true};
        change.folder_toggle = true;
        changes.push_back(std::move(change));
      }
      if (open) DrawChildren(control.id, frame_values);
    } else if (control.kind == "button") {
      if (ImGui::Button(control.label.c_str())) changes.push_back({control.id, 1, true});
    } else if (control.kind == "label") {
      Napi::Value input = frame_values.Get(control.id);
      const std::string value = input.IsString() ? input.As<Napi::String>().Utf8Value() : "";
      ImGui::TextWrapped("%s", value.c_str());
    } else if (control.kind == "boolean") {
      bool value = frame_values.Get(control.id).ToBoolean();
      if (ImGui::Checkbox(control.label.c_str(), &value)) {
        changes.push_back({control.id, value ? 1.0 : 0.0, true});
      }
    } else if (control.kind == "number") {
      Napi::Value input = frame_values.Get(control.id);
      double value = input.IsNumber() ? input.As<Napi::Number>().DoubleValue() : 0.0;
      bool changed = false;
      ImGui::SetNextItemWidth(170);
      if (control.has_min && control.has_max && control.max > control.min) {
        const int decimals = control.decimals >= 0 ? control.decimals : (control.step >= 1 ? 0 : 3);
        const std::string format = "%0." + std::to_string(decimals) + "f";
        changed = ImGui::SliderScalar(control.label.c_str(), ImGuiDataType_Double, &value,
          &control.min, &control.max, format.c_str());
      } else {
        changed = ImGui::InputDouble(control.label.c_str(), &value, control.step > 0 ? control.step : 0.1);
      }
      const bool finished = ImGui::IsItemDeactivatedAfterEdit();
      if (changed && control.step > 0) value = std::round(value / control.step) * control.step;
      if (changed && control.has_min) value = std::max(control.min, value);
      if (changed && control.has_max) value = std::min(control.max, value);
      if (changed || finished) {
        Change change{control.id, value, finished};
        change.changed = changed;
        changes.push_back(std::move(change));
      }
    } else if (control.kind == "string") {
      Napi::Value input = frame_values.Get(control.id);
      const std::string current = input.IsString() ? input.As<Napi::String>().Utf8Value() : "";
      std::vector<char> buffer(std::max<size_t>(current.size() + 1, 4096), '\0');
      std::memcpy(buffer.data(), current.data(), current.size());
      ImGui::SetNextItemWidth(170);
      const bool changed = ImGui::InputText(control.label.c_str(), buffer.data(), buffer.size());
      const bool finished = ImGui::IsItemDeactivatedAfterEdit();
      if (changed || finished) {
        Change change{control.id, 0, finished};
        change.changed = changed;
        change.text = buffer.data();
        change.has_text = true;
        changes.push_back(std::move(change));
      }
    } else if (control.kind == "select") {
      Napi::Value input = frame_values.Get(control.id);
      int selected = input.IsNumber() ? input.As<Napi::Number>().Int32Value() : 0;
      const char* preview = selected >= 0 && selected < static_cast<int>(control.options.size())
        ? control.options[selected].c_str() : "";
      ImGui::SetNextItemWidth(170);
      if (ImGui::BeginCombo(control.label.c_str(), preview)) {
        for (int option = 0; option < static_cast<int>(control.options.size()); ++option) {
          if (ImGui::Selectable(control.options[option].c_str(), selected == option)) {
            changes.push_back({control.id, static_cast<double>(option), true});
          }
        }
        ImGui::EndCombo();
      }
    } else if (control.kind == "color") {
      Napi::Value input = frame_values.Get(control.id);
      if (input.IsArray()) {
        Napi::Array channels = input.As<Napi::Array>();
        if (channels.Length() >= 3) {
          float color[3] = {
            channels.Get(uint32_t{0}).ToNumber().FloatValue(),
            channels.Get(uint32_t{1}).ToNumber().FloatValue(),
            channels.Get(uint32_t{2}).ToNumber().FloatValue(),
          };
          ImGui::SetNextItemWidth(170);
          const bool changed = ImGui::ColorEdit3(control.label.c_str(), color);
          const bool finished = ImGui::IsItemDeactivatedAfterEdit();
          if (changed || finished) {
            Change change{control.id, 0, finished};
            change.changed = changed;
            change.color = {color[0], color[1], color[2]};
            changes.push_back(std::move(change));
          }
        }
      }
    }
    if (control.disabled) ImGui::EndDisabled();
    ImGui::PopID();
  }
}

}  // namespace

Napi::Value Init(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (active_context) return Fail(env, "ImGui research context already initialized");
  if (info.Length() < 1 || !info[0].IsExternal()) return Fail(env, "Expected opaque GLFW window handle");
  active_window = static_cast<GLFWwindow*>(info[0].As<Napi::External<void>>().Data());
  if (glfwGetCurrentContext() != active_window) {
    active_window = nullptr;
    return Fail(env, "GLFW window context must be current before ImGui initialization");
  }
  IMGUI_CHECKVERSION();
  active_context = ImGui::CreateContext();
  previous_frame_time = 0;
  SetContext();
  ImGui::GetIO().IniFilename = nullptr;
  ImGui::StyleColorsDark();
  // Node3D owns GLFW callbacks. Input arrives as its typed window events in Render.
  if (!ImGui_ImplGlfw_InitForOpenGL(active_window, false)) {
    ImGui::DestroyContext(active_context);
    active_context = nullptr;
    active_window = nullptr;
    return Fail(env, "ImGui GLFW backend initialization failed");
  }
  if (!ImGui_ImplOpenGL3_Init("#version 140")) {
    ImGui_ImplGlfw_Shutdown();
    ImGui::DestroyContext(active_context);
    active_context = nullptr;
    active_window = nullptr;
    return Fail(env, "ImGui OpenGL backend initialization failed");
  }
  return env.Undefined();
}

Napi::Value Define(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (!active_context) return Fail(env, "ImGui research context is not initialized");
  if (info.Length() < 1 || !info[0].IsArray()) return Fail(env, "Expected controller descriptor array");
  Napi::Array source = info[0].As<Napi::Array>();
  std::vector<Control> next;
  next.reserve(source.Length());
  for (uint32_t i = 0; i < source.Length(); ++i) {
    Napi::Value entry = source.Get(i);
    if (!entry.IsObject()) return Fail(env, "Controller descriptor must be an object");
    Napi::Object object = entry.As<Napi::Object>();
    Napi::Value kind = object.Get("kind");
    Napi::Value label = object.Get("label");
    Napi::Value parent = object.Get("parent");
    if (!kind.IsString() || !label.IsString() || !parent.IsNumber()) {
      return Fail(env, "Invalid controller descriptor");
    }
    Control control;
    control.id = static_cast<int>(i);
    control.parent = parent.As<Napi::Number>().Int32Value();
    control.kind = kind.As<Napi::String>().Utf8Value();
    control.label = label.As<Napi::String>().Utf8Value();
    Napi::Value min = object.Get("min");
    Napi::Value max = object.Get("max");
    Napi::Value step = object.Get("step");
    Napi::Value decimals = object.Get("decimals");
    Napi::Value hidden = object.Get("hidden");
    Napi::Value disabled = object.Get("disabled");
    Napi::Value closed = object.Get("closed");
    control.min = min.IsNumber() ? min.As<Napi::Number>().DoubleValue() : 0;
    control.max = max.IsNumber() ? max.As<Napi::Number>().DoubleValue() : 0;
    control.has_min = min.IsNumber();
    control.has_max = max.IsNumber();
    control.step = step.IsNumber() ? step.As<Napi::Number>().DoubleValue() : 0;
    control.decimals = decimals.IsNumber() ? decimals.As<Napi::Number>().Int32Value() : -1;
    control.hidden = hidden.IsBoolean() && hidden.As<Napi::Boolean>().Value();
    control.disabled = disabled.IsBoolean() && disabled.As<Napi::Boolean>().Value();
    control.closed = closed.IsBoolean() && closed.As<Napi::Boolean>().Value();
    Napi::Value options = object.Get("options");
    if (options.IsArray()) {
      Napi::Array items = options.As<Napi::Array>();
      for (uint32_t n = 0; n < items.Length(); ++n) {
        Napi::Value item = items.Get(n);
        if (!item.IsString()) return Fail(env, "Option label must be a string");
        control.options.push_back(item.As<Napi::String>().Utf8Value());
      }
    }
    next.push_back(std::move(control));
  }
  controls = std::move(next);
  if (info.Length() > 1 && info[1].IsObject()) {
    Napi::Object panel = info[1].As<Napi::Object>();
    Napi::Value title = panel.Get("title");
    Napi::Value id = panel.Get("id");
    Napi::Value x = panel.Get("x");
    Napi::Value hidden = panel.Get("hidden");
    Napi::Value closed = panel.Get("closed");
    Napi::Value width = panel.Get("width");
    Napi::Value height = panel.Get("height");
    if (title.IsString()) panel_title = title.As<Napi::String>().Utf8Value();
    if (id.IsNumber()) panel_id = id.As<Napi::Number>().Int32Value();
    if (x.IsNumber()) panel_x = x.As<Napi::Number>().Int32Value();
    panel_hidden = hidden.IsBoolean() && hidden.As<Napi::Boolean>().Value();
    panel_closed = closed.IsBoolean() && closed.As<Napi::Boolean>().Value();
    if (width.IsNumber()) panel_width = std::max(120, width.As<Napi::Number>().Int32Value());
    panel_height = height.IsNumber() ? std::max(120, height.As<Napi::Number>().Int32Value()) : 0;
  }
  return env.Undefined();
}

Napi::Value Render(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (!active_context) return Fail(env, "ImGui research context is not initialized");
  if (info.Length() < 1 || !info[0].IsArray()) return Fail(env, "Expected controller values array");
  if (glfwGetCurrentContext() != active_window) return Fail(env, "GLFW window context changed");
  Napi::Array frame_values = info[0].As<Napi::Array>();
  if (frame_values.Length() != controls.size()) return Fail(env, "Controller value count does not match definitions");
  SetContext();
  changes.clear();
  ImGui_ImplOpenGL3_NewFrame();
  // The GLFW backend polls the cursor even when callbacks are disabled. Input
  // routing belongs to Node3D, so only the queued events below reach ImGui.
  ImGuiIO& io = ImGui::GetIO();
  int width = 0, height = 0, framebuffer_width = 0, framebuffer_height = 0;
  glfwGetWindowSize(active_window, &width, &height);
  glfwGetFramebufferSize(active_window, &framebuffer_width, &framebuffer_height);
  io.DisplaySize = ImVec2(static_cast<float>(width), static_cast<float>(height));
  io.DisplayFramebufferScale = ImVec2(
    width > 0 ? static_cast<float>(framebuffer_width) / width : 1.0f,
    height > 0 ? static_cast<float>(framebuffer_height) / height : 1.0f);
  const double now = glfwGetTime();
  io.DeltaTime = previous_frame_time > 0 && now > previous_frame_time
    ? static_cast<float>(now - previous_frame_time) : 1.0f / 60.0f;
  previous_frame_time = now;
  if (info.Length() > 3 && !info[3].IsUndefined()) {
    if (!info[3].IsObject()) return Fail(env, "Expected render surface dimensions");
    Napi::Object surface = info[3].As<Napi::Object>();
    Napi::Value width_value = surface.Get("width");
    Napi::Value height_value = surface.Get("height");
    if (!width_value.IsNumber() || !height_value.IsNumber())
      return Fail(env, "Expected numeric render surface dimensions");
    const double width = width_value.As<Napi::Number>().DoubleValue();
    const double height = height_value.As<Napi::Number>().DoubleValue();
    if (!std::isfinite(width) || !std::isfinite(height) || width < 1 || height < 1 ||
        width > 8192 || height > 8192)
      return Fail(env, "Invalid render surface dimensions");
    io.DisplaySize = ImVec2(static_cast<float>(width), static_cast<float>(height));
    io.DisplayFramebufferScale = ImVec2(1, 1);
  }
  if (info.Length() > 1) {
    if (!info[1].IsArray()) return Fail(env, "Expected Node3D input event array");
    Napi::Array events = info[1].As<Napi::Array>();
    ImGuiIO& io = ImGui::GetIO();
    for (uint32_t i = 0; i < events.Length(); ++i) {
      Napi::Object event = events.Get(i).As<Napi::Object>();
      const std::string type = event.Get("type").As<Napi::String>().Utf8Value();
      if (type == "mousemove" || type == "mousedown" || type == "mouseup" || type == "wheel") {
        io.AddMousePosEvent(event.Get("x").As<Napi::Number>().FloatValue(),
          event.Get("y").As<Napi::Number>().FloatValue());
      }
      if (type == "mousedown" || type == "mouseup") {
        const int button = event.Get("button").As<Napi::Number>().Int32Value();
        if (button >= 0 && button < 5) io.AddMouseButtonEvent(button, type == "mousedown");
      } else if (type == "wheel") {
        io.AddMouseWheelEvent(event.Get("deltaX").As<Napi::Number>().FloatValue() / 100.0f,
          event.Get("deltaY").As<Napi::Number>().FloatValue() / 100.0f);
      } else if (type == "keydown" || type == "keyup") {
        const bool down = type == "keydown";
        const std::string code = event.Get("code").As<Napi::String>().Utf8Value();
        ImGuiKey key = ImGuiKey_None;
        if (code.size() == 4 && code.substr(0, 3) == "Key" && code[3] >= 'A' && code[3] <= 'Z')
          key = static_cast<ImGuiKey>(ImGuiKey_A + code[3] - 'A');
        else if (code.size() == 6 && code.substr(0, 5) == "Digit" && code[5] >= '0' && code[5] <= '9')
          key = static_cast<ImGuiKey>(ImGuiKey_0 + code[5] - '0');
        else if (code == "Tab") key = ImGuiKey_Tab;
        else if (code == "Enter" || code == "NumpadEnter") key = ImGuiKey_Enter;
        else if (code == "Escape") key = ImGuiKey_Escape;
        else if (code == "Backspace") key = ImGuiKey_Backspace;
        else if (code == "Delete") key = ImGuiKey_Delete;
        else if (code == "ArrowLeft") key = ImGuiKey_LeftArrow;
        else if (code == "ArrowRight") key = ImGuiKey_RightArrow;
        else if (code == "ArrowUp") key = ImGuiKey_UpArrow;
        else if (code == "ArrowDown") key = ImGuiKey_DownArrow;
        else if (code == "Home") key = ImGuiKey_Home;
        else if (code == "End") key = ImGuiKey_End;
        if (key != ImGuiKey_None) io.AddKeyEvent(key, down);
        io.AddKeyEvent(ImGuiMod_Ctrl, event.Get("ctrlKey").ToBoolean());
        io.AddKeyEvent(ImGuiMod_Shift, event.Get("shiftKey").ToBoolean());
        io.AddKeyEvent(ImGuiMod_Alt, event.Get("altKey").ToBoolean());
        io.AddKeyEvent(ImGuiMod_Super, event.Get("metaKey").ToBoolean());
        const int character = event.Get("charCode").As<Napi::Number>().Int32Value();
        if (down && character > 0) io.AddInputCharacter(static_cast<unsigned int>(character));
      }
    }
  }
  ImGui::NewFrame();
    ImGui::SetNextWindowPos(ImVec2(static_cast<float>(panel_x), 15), ImGuiCond_FirstUseEver);
  if (!panel_hidden) {
    ImGui::SetNextWindowSize(ImVec2(static_cast<float>(panel_width), static_cast<float>(panel_height)), ImGuiCond_FirstUseEver);
    auto known = panel_closed_state.find(panel_id);
    if (known == panel_closed_state.end() || known->second != panel_closed) {
      ImGui::SetNextWindowCollapsed(panel_closed, ImGuiCond_Always);
    }
    const std::string window_name = panel_title + "###node3d_gui_" + std::to_string(panel_id);
    const bool visible = ImGui::Begin(window_name.c_str());
    const bool open = !ImGui::IsWindowCollapsed();
    panel_closed_state[panel_id] = !open;
    if (open == panel_closed) {
      Change change{-1, open ? 1.0 : 0.0, true};
      change.folder_toggle = true;
      changes.push_back(std::move(change));
    }
    if (visible && open) DrawChildren(-1, frame_values);
    ImGui::End();
  }
  Napi::Array actions = Napi::Array::New(env);
  if (info.Length() > 2) DrawGameUI(env, info[2], actions);
  ImGui::Render();
  ImGui_ImplOpenGL3_RenderDrawData(ImGui::GetDrawData());
  Napi::Array output = Napi::Array::New(env, changes.size());
  for (uint32_t i = 0; i < changes.size(); ++i) {
    Napi::Object change = Napi::Object::New(env);
    change.Set("id", Napi::Number::New(env, changes[i].id));
    if (changes[i].has_text) {
      change.Set("value", Napi::String::New(env, changes[i].text));
    } else if (changes[i].color.empty()) {
      change.Set("value", Napi::Number::New(env, changes[i].value));
    } else {
      Napi::Array color = Napi::Array::New(env, 3);
      for (uint32_t channel = 0; channel < 3; ++channel) color.Set(channel, changes[i].color[channel]);
      change.Set("value", color);
    }
    change.Set("finished", Napi::Boolean::New(env, changes[i].finished));
    change.Set("changed", Napi::Boolean::New(env, changes[i].changed));
    change.Set("folderToggle", Napi::Boolean::New(env, changes[i].folder_toggle));
    output.Set(i, change);
  }
  Napi::Object result = Napi::Object::New(env);
  result.Set("changes", output);
  result.Set("actions", actions);
  result.Set("captureMouse", Napi::Boolean::New(env, ImGui::GetIO().WantCaptureMouse));
  result.Set("captureKeyboard", Napi::Boolean::New(env, ImGui::GetIO().WantCaptureKeyboard));
  return result;
}

Napi::Value Shutdown(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (!active_context) return env.Undefined();
  if (glfwGetCurrentContext() != active_window) return Fail(env, "GLFW window context must be current for shutdown");
  SetContext();
  ReleaseAllGameImages();
  ImGui_ImplOpenGL3_Shutdown();
  ImGui_ImplGlfw_Shutdown();
  ImGui::DestroyContext(active_context);
  active_context = nullptr;
  active_window = nullptr;
  previous_frame_time = 0;
  controls.clear();
  changes.clear();
  panel_closed_state.clear();
  folder_closed_state.clear();
  return env.Undefined();
}

Napi::Value ResetInput(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (!active_context || glfwGetCurrentContext() != active_window)
    return Fail(env, "Current GameUI window is required to reset input");
  SetContext();
  ImGuiIO& io = ImGui::GetIO();
  io.ClearInputKeys();
  io.ClearInputMouse();
  return env.Undefined();
}

Napi::Value SuspendWindow(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (!active_context || !active_window || glfwGetCurrentContext() != active_window)
    return Fail(env, "Current GameUI window is required before a mode switch");
  SetContext();
  ImGuiIO& io = ImGui::GetIO();
  io.ClearInputKeys();
  io.ClearInputMouse();
  // GLFW backend owns the per-window WndProc hook and cursor state. OpenGL
  // objects remain in the root-shared context group and are kept intact.
  ImGui_ImplGlfw_Shutdown();
  active_window = nullptr;
  return env.Undefined();
}

Napi::Value ResumeWindow(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (!active_context || active_window || info.Length() != 1 || !info[0].IsExternal())
    return Fail(env, "Expected a new GLFW window for GameUI rebind");
  GLFWwindow* window = static_cast<GLFWwindow*>(info[0].As<Napi::External<void>>().Data());
  if (glfwGetCurrentContext() != window)
    return Fail(env, "New GLFW window context must be current for GameUI rebind");
  SetContext();
  if (!ImGui_ImplGlfw_InitForOpenGL(window, false))
    return Fail(env, "Could not bind GameUI to the new GLFW window");
  active_window = window;
  previous_frame_time = 0;
  return env.Undefined();
}

}  // namespace research
