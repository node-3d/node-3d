#pragma once

#include <napi.h>

namespace research {
Napi::Value Init(const Napi::CallbackInfo& info);
Napi::Value Define(const Napi::CallbackInfo& info);
Napi::Value Render(const Napi::CallbackInfo& info);
Napi::Value ResetInput(const Napi::CallbackInfo& info);
Napi::Value SuspendWindow(const Napi::CallbackInfo& info);
Napi::Value ResumeWindow(const Napi::CallbackInfo& info);
Napi::Value Shutdown(const Napi::CallbackInfo& info);
}
