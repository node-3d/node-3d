#include "game-ui.hpp"

#include <algorithm>
#include <cmath>
#include <cstdint>
#include <cstring>
#include <limits>
#include <string>
#include <unordered_map>

#include <GLFW/glfw3.h>
#include "imgui.h"

namespace research {
namespace {

std::unordered_map<uint32_t, GLuint> game_images;
uint32_t next_image_id = 1;
std::unordered_map<uint32_t, ImFont*> game_fonts;
uint32_t next_font_id = 1;

bool Number(Napi::Object source, const char* key, float* out) {
  Napi::Value value = source.Get(key);
  if (!value.IsNumber()) return false;
  const double number = value.As<Napi::Number>().DoubleValue();
  if (!std::isfinite(number) || std::abs(number) > 1000000) return false;
  *out = static_cast<float>(number);
  return true;
}

ImU32 Color(Napi::Object source, const char* key, ImU32 fallback = IM_COL32_WHITE) {
  Napi::Value value = source.Get(key);
  return value.IsNumber() ? value.As<Napi::Number>().Uint32Value() : fallback;
}

bool Rect(Napi::Object source, float* x, float* y, float* w, float* h) {
  return Number(source, "x", x) && Number(source, "y", y) &&
    Number(source, "w", w) && Number(source, "h", h) && *w >= 0 && *h >= 0;
}

void Text(ImDrawList* draw, Napi::Object command, float x, float y, ImU32 color) {
  Napi::Value value = command.Get("text");
  if (!value.IsString()) return;
  float size = 22;
  Number(command, "size", &size);
  size = std::clamp(size, 8.0f, 120.0f);
  const std::string text = value.As<Napi::String>().Utf8Value();
  ImFont* font = ImGui::GetFont();
  Napi::Value font_value = command.Get("font");
  if (font_value.IsNumber()) {
    auto found = game_fonts.find(font_value.As<Napi::Number>().Uint32Value());
    if (found != game_fonts.end()) font = found->second;
  }
  draw->AddText(font, size, ImVec2(x, y), color, text.c_str());
}

}  // namespace

Napi::Value CreateGameFont(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (glfwGetCurrentContext() == nullptr || ImGui::GetCurrentContext() == nullptr) {
    Napi::Error::New(env, "A current GameUI context is required for font loading").ThrowAsJavaScriptException();
    return env.Undefined();
  }
  if (info.Length() != 2 || !info[0].IsBuffer() || !info[1].IsNumber()) {
    Napi::TypeError::New(env, "Expected TTF/OTF Buffer and font size").ThrowAsJavaScriptException();
    return env.Undefined();
  }
  const auto data = info[0].As<Napi::Buffer<uint8_t>>();
  const double size = info[1].As<Napi::Number>().DoubleValue();
  if (data.Length() < 16 || data.Length() > 16 * 1024 * 1024 ||
      !std::isfinite(size) || size < 8 || size > 120) {
    Napi::RangeError::New(env, "Invalid font data or size").ThrowAsJavaScriptException();
    return env.Undefined();
  }
  void* owned = IM_ALLOC(data.Length());
  if (!owned) {
    Napi::Error::New(env, "Could not allocate font data").ThrowAsJavaScriptException();
    return env.Undefined();
  }
  std::memcpy(owned, data.Data(), data.Length());
  ImFont* font = ImGui::GetIO().Fonts->AddFontFromMemoryTTF(
    owned, static_cast<int>(data.Length()), static_cast<float>(size));
  if (!font) {
    IM_FREE(owned);
    Napi::Error::New(env, "Could not load font").ThrowAsJavaScriptException();
    return env.Undefined();
  }
  const uint32_t id = next_font_id++;
  game_fonts.emplace(id, font);
  return Napi::Number::New(env, id);
}

Napi::Value CreateGameImage(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (glfwGetCurrentContext() == nullptr) {
    Napi::Error::New(env, "A current GLFW context is required for image upload").ThrowAsJavaScriptException();
    return env.Undefined();
  }
  if (info.Length() != 3 || !info[0].IsNumber() || !info[1].IsNumber() || !info[2].IsBuffer()) {
    Napi::TypeError::New(env, "Expected width, height, and RGBA Buffer").ThrowAsJavaScriptException();
    return env.Undefined();
  }
  const int width = info[0].As<Napi::Number>().Int32Value();
  const int height = info[1].As<Napi::Number>().Int32Value();
  const auto pixels = info[2].As<Napi::Buffer<uint8_t>>();
  if (width < 1 || height < 1 || width > 8192 || height > 8192 ||
      static_cast<uint64_t>(width) * static_cast<uint64_t>(height) * 4 != pixels.Length()) {
    Napi::RangeError::New(env, "Image dimensions or RGBA buffer length are invalid").ThrowAsJavaScriptException();
    return env.Undefined();
  }
  GLint previous = 0;
  glGetIntegerv(GL_TEXTURE_BINDING_2D, &previous);
  GLuint texture = 0;
  glGenTextures(1, &texture);
  if (!texture) {
    Napi::Error::New(env, "Could not create a game UI texture").ThrowAsJavaScriptException();
    return env.Undefined();
  }
  glBindTexture(GL_TEXTURE_2D, texture);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
  GLint unpack_alignment = 0;
  glGetIntegerv(GL_UNPACK_ALIGNMENT, &unpack_alignment);
  glPixelStorei(GL_UNPACK_ALIGNMENT, 1);
  glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, pixels.Data());
  glPixelStorei(GL_UNPACK_ALIGNMENT, unpack_alignment);
  glBindTexture(GL_TEXTURE_2D, static_cast<GLuint>(previous));
  const uint32_t id = next_image_id++;
  game_images.emplace(id, texture);
  return Napi::Number::New(env, id);
}

Napi::Value ReleaseGameImage(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (info.Length() != 1 || !info[0].IsNumber()) {
    Napi::TypeError::New(env, "Expected game UI image ID").ThrowAsJavaScriptException();
    return env.Undefined();
  }
  const uint32_t id = info[0].As<Napi::Number>().Uint32Value();
  auto found = game_images.find(id);
  if (found != game_images.end()) {
    if (glfwGetCurrentContext() == nullptr) {
      Napi::Error::New(env, "A current GLFW context is required for image release").ThrowAsJavaScriptException();
      return env.Undefined();
    }
    glDeleteTextures(1, &found->second);
    game_images.erase(found);
  }
  return env.Undefined();
}

void ReleaseAllGameImages() {
  for (const auto& [id, texture] : game_images) glDeleteTextures(1, &texture);
  game_images.clear();
  game_fonts.clear();
}

void DrawGameUI(Napi::Env env, Napi::Value frame, Napi::Array actions) {
  if (!frame.IsArray()) return;
  Napi::Array commands = frame.As<Napi::Array>();
  ImDrawList* draw = ImGui::GetForegroundDrawList();
  bool has_buttons = false;
  for (uint32_t i = 0; i < commands.Length(); ++i) {
    Napi::Value value = commands.Get(i);
    if (value.IsObject() && value.As<Napi::Object>().Get("kind").ToString().Utf8Value() == "button") {
      has_buttons = true;
      break;
    }
  }
  if (has_buttons) {
    ImGui::SetNextWindowPos(ImVec2(0, 0));
    ImGui::SetNextWindowSize(ImGui::GetIO().DisplaySize);
    ImGui::Begin("##node3d_game_ui", nullptr,
      ImGuiWindowFlags_NoDecoration | ImGuiWindowFlags_NoBackground | ImGuiWindowFlags_NoMove |
      ImGuiWindowFlags_NoSavedSettings | ImGuiWindowFlags_NoScrollbar |
      ImGuiWindowFlags_NoScrollWithMouse);
  }
  for (uint32_t i = 0; i < commands.Length(); ++i) {
    Napi::Value value = commands.Get(i);
    if (!value.IsObject()) continue;
    Napi::Object command = value.As<Napi::Object>();
    Napi::Value kind_value = command.Get("kind");
    if (!kind_value.IsString()) continue;
    const std::string kind = kind_value.As<Napi::String>().Utf8Value();
    float x = 0, y = 0, w = 0, h = 0;
    if (kind == "rect" && Rect(command, &x, &y, &w, &h)) {
      draw->AddRectFilled(ImVec2(x, y), ImVec2(x + w, y + h), Color(command, "color"));
    } else if (kind == "text" && Number(command, "x", &x) && Number(command, "y", &y)) {
      Text(draw, command, x, y, Color(command, "color"));
    } else if (kind == "image" && Rect(command, &x, &y, &w, &h)) {
      Napi::Value image_value = command.Get("image");
      if (!image_value.IsNumber()) continue;
      const uint32_t id = image_value.As<Napi::Number>().Uint32Value();
      auto found = game_images.find(id);
      if (found != game_images.end()) {
        draw->AddImage(ImTextureRef(static_cast<ImTextureID>(found->second)),
          ImVec2(x, y), ImVec2(x + w, y + h), ImVec2(0, 1), ImVec2(1, 0));
      }
    } else if (kind == "button" && has_buttons && Rect(command, &x, &y, &w, &h)) {
      Napi::Value id_value = command.Get("id");
      if (!id_value.IsString()) continue;
      const std::string id = id_value.As<Napi::String>().Utf8Value();
      ImGui::PushID(static_cast<int>(i));
      ImGui::SetCursorScreenPos(ImVec2(x, y));
      const bool clicked = ImGui::InvisibleButton(id.c_str(), ImVec2(w, h));
      const bool hovered = ImGui::IsItemHovered();
      ImGui::PopID();
      if (clicked) actions.Set(actions.Length(), id);
      draw->AddRectFilled(ImVec2(x, y), ImVec2(x + w, y + h),
        hovered ? Color(command, "hoverColor", IM_COL32(60, 80, 100, 220)) :
          Color(command, "color", IM_COL32(20, 30, 40, 200)), 6.0f);
      float size = 30;
      Number(command, "size", &size);
      size = std::clamp(size, 8.0f, 120.0f);
      const float text_y = y + (h - size) * 0.5f;
      Text(draw, command, x + 16, text_y, Color(command, "textColor"));
    }
  }
  if (has_buttons) ImGui::End();
}

}  // namespace research
