/*
 * Copyright (c) 2022 Huawei Device Co., Ltd.
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

import Extension from '@ohos.application.DataShareExtensionAbility'
import rdb from '@ohos.data.rdb'
import Logger from '../util/Logger'

const TAG: string = 'DataShareExtAbility'
const TABLE_NAME: string = 'books'
const STORE_CONFIG: rdb.StoreConfig = { name: 'books.db' }
const SQL_CREATE_TABLE: string = 'CREATE TABLE IF NOT EXISTS books (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, introduction TEXT NOT NULL)'
let rdbStore: rdb.RdbStore = undefined

// 对应FA的DataAbility下的Data.ts
export default class DataShareExtAbility extends Extension {

  // 对应FA的onInitialized
  onCreate(want, callback) {
    Logger.info(TAG, ` DataShareExtAbility onCreate, want: ${JSON.stringify(want.abilityName)}`)
    rdb.getRdbStore(this.context, STORE_CONFIG, 1, (err, data) => {
      Logger.info(TAG, `DataShareExtAbility getRdbStore done`)
      rdbStore = data
      rdbStore.executeSql(SQL_CREATE_TABLE, [], () => {
        Logger.info(TAG, `DataShareExtAbility executeSql done`)
      })
      if (callback) {
        callback()
      }
    })
    Logger.info(TAG, `DataShareExtAbility onCreate end`)
  }

  // 对应FA的insert
  insert(uri, value, callback) {
    Logger.info(TAG, `[insert] enter`)
    if (value === null) {
      Logger.info(' [insert] invalid valueBuckets')
      return
    }
    Logger.info(TAG, ` [insert]  value = ${JSON.stringify(value)}`)
    if (rdbStore) {
      rdbStore.insert(TABLE_NAME, value, (err, ret) => {
        Logger.info(TAG, ` [insert] leave ${ret}`)
        if (callback !== undefined) {
          callback(err, ret)
        }
      })
    }
  }

  // 对应FA的delete
  delete(uri, predicates, callback) {
    Logger.info(TAG, `delete`)
    try {
      if (rdbStore) {
        rdbStore.delete(TABLE_NAME, predicates, (err, ret) => {
          Logger.info(TAG, `delete ret: ${ret}`)
          callback(err, ret)
        })
      }
    } catch (err) {
      Logger.error(TAG, `delete error: ${JSON.stringify(err)}`)
    }
  }

  // 对应FA的query
  query(uri, predicates, columns, callback) {
    Logger.info(TAG, `query enter`)
    try {
      if (rdbStore) {
        rdbStore.query(TABLE_NAME, predicates, columns, (err, resultSet) => {
          Logger.info(TAG, `query ret: ${resultSet}`)
          if (resultSet !== undefined) {
            Logger.info(TAG, `query resultSet.rowCount: ${JSON.stringify(resultSet.rowCount)}`)
          }
          if (callback !== undefined) {
            callback(err, resultSet)
          }
        })
      }
    } catch (err) {
      Logger.error(TAG, `query error: ${JSON.stringify(err)}`)
    }
    Logger.info(TAG, `query leave`)
  }

  // 对应FA的update
  update(uri, predicates, value, callback) {
    if (predicates === null || predicates === undefined) {
      return
    }
    if (rdbStore) {
      rdbStore.update(TABLE_NAME, value, predicates, function (err, ret) {
        if (callback !== undefined) {
          callback(err, ret)
        }
      })
    }
  }
}