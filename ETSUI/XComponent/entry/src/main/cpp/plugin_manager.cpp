/*
 * Copyright (c) 2021 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#include <cstdint>
#include <string>

#include <ace/xcomponent/native_interface_xcomponent.h>

#include "plugin_common.h"
#include "plugin_manager.h"

enum ContextType {
    APP_LIFECYCLE = 0,
    JS_PAGE_LIFECYCLE,
};

PluginManager PluginManager::manager_;

napi_value PluginManager::GetContext(napi_env env, napi_callback_info info)
{
    napi_status status;
    napi_value exports;
    size_t argc = 1;
    napi_value args[1];
    NAPI_CALL(env, napi_get_cb_info(env, info, &argc, args, nullptr, nullptr));

    if (argc != 1) {
        napi_throw_type_error(env, NULL, "Wrong number of arguments");
        return nullptr;
    }

    napi_valuetype valuetype;
    status = napi_typeof(env, args[0], &valuetype);
    if (status != napi_ok) {
        return nullptr;
    }
    if (valuetype != napi_number) {
        napi_throw_type_error(env, NULL, "Wrong arguments");
        return nullptr;
    }

    int64_t value;
    NAPI_CALL(env, napi_get_value_int64(env, args[0], &value));

    NAPI_CALL(env, napi_create_object(env, &exports));

    switch (value) {
        case APP_LIFECYCLE:
            {
                /**** AppInit 对应 app.ets中的应用生命周期 onCreate, onShow, onHide, onDestroy ******/
                LOGD("GetContext APP_LIFECYCLE");
                /**** Register App Lifecycle  ******/
                napi_property_descriptor desc[] = {
                    DECLARE_NAPI_FUNCTION("onCreate", PluginManager::NapiOnCreate),
                    DECLARE_NAPI_FUNCTION("onShow", PluginManager::NapiOnShow),
                    DECLARE_NAPI_FUNCTION("onHide", PluginManager::NapiOnHide),
                    DECLARE_NAPI_FUNCTION("onDestroy", PluginManager::NapiOnDestroy),
                };
                NAPI_CALL(env, napi_define_properties(env, exports, sizeof(desc) / sizeof(desc[0]), desc));
            }

            break;
        case JS_PAGE_LIFECYCLE:
            {
                /****************  声明式开发范式 JS Page 生命周期注册 ****************************/
                LOGD("GetContext JS_PAGE_LIFECYCLE");
                napi_property_descriptor desc[] = {
                    DECLARE_NAPI_FUNCTION("aboutToAppear", PluginManager::NapiAboutToAppear),
                    DECLARE_NAPI_FUNCTION("aboutToDisappear", PluginManager::NapiAboutToDisappear),
                    DECLARE_NAPI_FUNCTION("onPageShow", PluginManager::NapiOnPageShow),
                    DECLARE_NAPI_FUNCTION("onPageHide", PluginManager::NapiOnPageHide),
                };
                NAPI_CALL(env, napi_define_properties(env, exports, sizeof(desc) / sizeof(desc[0]), desc));
            }
            break;
        default:
            LOGE("unknown type");
    }
    return exports;
}

bool PluginManager::Export(napi_env env, napi_value exports)
{
    napi_status status;
    napi_value exportInstance = nullptr;
    OH_NativeXComponent *nativeXComponent = nullptr;
    int32_t ret;
    char idStr[OH_XCOMPONENT_ID_LEN_MAX + 1] = { };
    uint64_t idSize = OH_XCOMPONENT_ID_LEN_MAX + 1;

    status = napi_get_named_property(env, exports, OH_NATIVE_XCOMPONENT_OBJ, &exportInstance);
    if (status != napi_ok) {
        return false;
    }

    status = napi_unwrap(env, exportInstance, reinterpret_cast<void**>(&nativeXComponent));
    if (status != napi_ok) {
        return false;
    }

    ret = OH_NativeXComponent_GetXComponentId(nativeXComponent, idStr, &idSize);
    if (ret != OH_NATIVEXCOMPONENT_RESULT_SUCCESS) {
        return false;
    }

    std::string id(idStr);
    auto context = PluginManager::GetInstance();
    if (context) {
        context->SetNativeXComponent(id, nativeXComponent);
        auto render = context->GetRender(id);
        render->SetNativeXComponent(nativeXComponent);
        render->Export(env, exports);
        return true;
    }

    return false;
}

void PluginManager::SetNativeXComponent(std::string& id, OH_NativeXComponent* nativeXComponent)
{
    if (nativeXComponentMap_.find(id) == nativeXComponentMap_.end()) {
        nativeXComponentMap_[id] = nativeXComponent;
    } else {
        if (nativeXComponentMap_[id] != nativeXComponent) {
            nativeXComponentMap_[id] = nativeXComponent;
        }
    }
}

OH_NativeXComponent* PluginManager::GetNativeXComponent(std::string& id)
{
    if (nativeXComponentMap_.find(id) == nativeXComponentMap_.end()) {
        return nullptr;
    } else {
        return nativeXComponentMap_[id];
    }
}

PluginRender* PluginManager::GetRender(std::string& id)
{
    if (pluginRenderMap_.find(id) == pluginRenderMap_.end()) {
        PluginRender* instance = PluginRender::GetInstance(id);
        pluginRenderMap_[id] = instance;
        return instance;
    } else {
        return pluginRenderMap_[id];
    }
}

void PluginManager::MainOnMessage(const uv_async_t* req)
{
    LOGD("MainOnMessage Triggered");
}
napi_value PluginManager::NapiOnCreate(napi_env env, napi_callback_info info)
{
    LOGD("PluginManager::NapiOnCreate");
    uv_loop_t* loop = nullptr;
    uv_check_t* check = new uv_check_t;
    NAPI_CALL(env, napi_get_uv_event_loop(env, &loop));
    PluginManager::GetInstance()->OnCreateNative(env, loop);
    return nullptr;
}

napi_value PluginManager::NapiOnShow(napi_env env, napi_callback_info info)
{
    PluginManager::GetInstance()->OnShowNative();
    return nullptr;
}

napi_value PluginManager::NapiAboutToAppear(napi_env env, napi_callback_info info)
{
    LOGD("PluginManager::NapiAboutToAppear");
    return nullptr;
}

napi_value PluginManager::NapiAboutToDisappear(napi_env env, napi_callback_info info)
{
    LOGD("PluginManager::NapiAboutToDisappear");
    return nullptr;
}

napi_value PluginManager::NapiOnHide(napi_env env, napi_callback_info info)
{
    PluginManager::GetInstance()->OnHideNative();
    return nullptr;
}

napi_value PluginManager::NapiOnDestroy(napi_env env, napi_callback_info info)
{
    PluginManager::GetInstance()->OnDestroyNative();
    return nullptr;
}

void PluginManager::OnCreateNative(napi_env env, uv_loop_t* loop)
{
    mainEnv_ = env;
    mainLoop_ = loop;
    if (mainLoop_) {
        uv_async_init(mainLoop_, &mainOnMessageSignal_, reinterpret_cast<uv_async_cb>(PluginManager::MainOnMessage));
    }
}

void PluginManager::OnShowNative()
{
    LOGD("PluginManager::OnShowNative");
}
void PluginManager::OnHideNative()
{
    LOGD("PluginManager::OnHideNative");
}
void PluginManager::OnDestroyNative()
{
    LOGD("PluginManager::OnDestroyNative");
}

napi_value PluginManager::NapiOnPageShow(napi_env env, napi_callback_info info)
{
    LOGD("PluginManager::NapiOnPageShow");
    return nullptr;
}

napi_value PluginManager::NapiOnPageHide(napi_env env, napi_callback_info info)
{
    LOGD("PluginManager::NapiOnPageHide");
    return nullptr;
}

void PluginManager::OnPageShowNative()
{
    LOGD("PluginManager::OnPageShowNative");
}

void PluginManager::OnPageHideNative()
{
    LOGD("PluginManager::OnPageHideNative");
}