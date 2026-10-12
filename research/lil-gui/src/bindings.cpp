#include "controls.hpp"
#include "game-ui.hpp"

Napi::Object InitModule(Napi::Env env, Napi::Object exports) {
  exports.Set("init", Napi::Function::New(env, research::Init));
  exports.Set("define", Napi::Function::New(env, research::Define));
  exports.Set("render", Napi::Function::New(env, research::Render));
  exports.Set("resetInput", Napi::Function::New(env, research::ResetInput));
  exports.Set("suspendWindow", Napi::Function::New(env, research::SuspendWindow));
  exports.Set("resumeWindow", Napi::Function::New(env, research::ResumeWindow));
  exports.Set("shutdown", Napi::Function::New(env, research::Shutdown));
  exports.Set("createGameImage", Napi::Function::New(env, research::CreateGameImage));
  exports.Set("releaseGameImage", Napi::Function::New(env, research::ReleaseGameImage));
  exports.Set("createGameFont", Napi::Function::New(env, research::CreateGameFont));
  return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, InitModule)
