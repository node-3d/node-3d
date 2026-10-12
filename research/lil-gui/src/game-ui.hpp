#pragma once

#include <napi.h>

namespace research {
Napi::Value CreateGameImage(const Napi::CallbackInfo& info);
Napi::Value ReleaseGameImage(const Napi::CallbackInfo& info);
Napi::Value CreateGameFont(const Napi::CallbackInfo& info);
void DrawGameUI(Napi::Env env, Napi::Value frame, Napi::Array actions);
void ReleaseAllGameImages();
}
