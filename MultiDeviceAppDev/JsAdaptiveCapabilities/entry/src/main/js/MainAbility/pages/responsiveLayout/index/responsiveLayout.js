/*
 *Copyright (c) 2022 Huawei Device Co., Ltd.
 *Licensed under the Apache License, Version 2.0 (the "License");
 *you may not use this file except in compliance with the License.
 *You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *Unless required by applicable law or agreed to in writing, software
 *distributed under the License is distributed on an "AS IS" BASIS,
 *WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *See the License for the specific language governing permissions and
 *limitations under the License.
*/

import router from '@ohos.router';

export default {
  data: {
    title: "",
    content: []
  },
  onInit() {
    this.title = this.$t("strings.responsive_layout");
    this.content = [
      {
        title: this.$t("strings.grid_layout"), uri: "pages/responsiveLayout/gridContainer/gridContainer"
      },
      {
        title: this.$t("strings.media_query"), uri: "pages/responsiveLayout/mediaQuery/mediaQuery"
      },
      {
        title: this.$t("strings.typical_scenario"), uri: "pages/responsiveLayout/typicalScene/index/index"
      }
    ]
  },
  onclick: function (uri) {
    router.push({
      url: uri
    });
  }
}