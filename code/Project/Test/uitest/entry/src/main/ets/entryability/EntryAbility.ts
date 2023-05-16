/*
* Copyright (c) 2023 Huawei Device Co., Ltd.
* Licensed under the Apache License, Version 2.0 (the "License")
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

import UIAbility from '@ohos.app.ability.UIAbility';
import window from '@ohos.window';
import Logger from '../util/Logger'

export default class EntryAbility extends UIAbility {
    onCreate(want, launchParam) {
      let context = this.context;
      Logger.info('EntryAbility', '%{public}s', 'EntryAbility onCreate');
    }

    onDestroy() {
      Logger.info('EntryAbility', '%{public}s', 'EntryAbility onDestroy');
    }

    onWindowStageCreate(windowStage: window.WindowStage) {
      // Main window is created, set main page for this ability
      Logger.info('EntryAbility', '%{public}s', 'Ability onWindowStageCreate');
      windowStage.loadContent('pages/Index', (err, data) => {
      if (err.code) {
          Logger.error('EntryAbility', 'Failed to load the content. Cause: %{public}s', JSON.stringify(err) ?? '');
          return;
      }
      Logger.info('EntryAbility', 'Succeeded in loading the content. Data: %{public}s', JSON.stringify(data) ?? '');
      });
    }

    onWindowStageDestroy() {
      // Main window is destroyed, release UI related resources
      Logger.info('EntryAbility', '%{public}s', 'EntryAbility onWindowStageDestroy');
    }

    onForeground() {
      // Ability has brought to foreground
      Logger.info('EntryAbility', '%{public}s', 'EntryAbility onForeground');
    }

    onBackground() {
      // Ability has back to background
      Logger.info('EntryAbility', '%{public}s', 'EntryAbility onBackground');
    }
}