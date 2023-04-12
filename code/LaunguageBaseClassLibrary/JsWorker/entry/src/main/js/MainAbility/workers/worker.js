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

import workers from '@ohos.worker'

const parentPort = workers.parentPort
const TAG = 'JsWorker.worker'

parentPort.onmessageerror = function (e) {
  let data = e.data
  console.info(`${TAG} onmessageerror:${JSON.stringify(data)}`)
}
parentPort.onmessage = function (e) {
  let data = e.data
  console.info(`${TAG} onmessage:${JSON.stringify(data)}`)
  if (data.objType == 'normal') {
    let obj = data.data
    console.info(`${TAG} postMessage obj: ${obj}`)
    let after = obj.split(",").sort()
    console.info(`${TAG} postMessage after: ${after}`)
    data.data = after
    parentPort.postMessage(data)
  }
}