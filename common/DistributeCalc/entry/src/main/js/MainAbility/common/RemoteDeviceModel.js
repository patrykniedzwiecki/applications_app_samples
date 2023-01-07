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

import deviceManager from '@ohos.distributedHardware.deviceManager'
import { logger } from './Logger'

let SUBSCRIBE_ID = 100
let TAG = 'RemoteDeviceModel'

export default class RemoteDeviceModel {
  deviceList = []
  discoverList = []
  callback
  authCallback
  deviceManager = undefined

  registerDeviceListCallback(callback) {
    logger.info(TAG, `deviceManager type =${typeof (this.deviceManager)} ,${JSON.stringify(this.deviceManager)} ,${JSON.stringify(this.deviceManager) === '{}'}`)
    if (typeof (this.deviceManager) === 'undefined' || JSON.stringify(this.deviceManager) === '{}') {
      logger.info(TAG, `deviceManager is null begin`)
      logger.info(TAG, `deviceManager.createDeviceManager begin`)
      try {
        deviceManager.createDeviceManager("ohos.samples.distributedcalc", (error, value) => {
          if (error) {
            logger.error(TAG, `createDeviceManager failed.`)
            return
          }
          this.deviceManager = value
          this.registerDeviceListCallback_(callback)
          logger.info(TAG, `createDeviceManager callback returned, error=${JSON.stringify(error.code)} , errorMessage=${error.message} value=${value}`)
        })
      } catch (error) {
        logger.error(TAG, `createDeviceManager throw error,  error.code=${JSON.stringify(error.code)} , errorMessage=${error.message}`)
      }
      logger.info(TAG, `deviceManager.createDeviceManager end`)
    } else {
      logger.info(TAG, `deviceManager not null begin`)
      this.registerDeviceListCallback_(callback)
    }
  }

  registerDeviceListCallback_(callback) {
    logger.info(TAG, `registerDeviceListCallback`)
    this.callback = callback
    if (this.deviceManager === undefined) {
      logger.error(TAG, `deviceManager has not initialized`)
      this.callback()
      return
    }

    logger.info(TAG, `getTrustedDeviceListSync begin`)
    try {
      let list = this.deviceManager.getTrustedDeviceListSync()
      logger.info(TAG, `getTrustedDeviceListSync end, list=${JSON.stringify(list)}`)
      if (typeof (list) !== 'undefined' && JSON.stringify(list) !== '[]') {
        this.deviceList = list
      }
      logger.info(TAG, `getTrustedDeviceListSync end, deviceList=${JSON.stringify(list)}`)
    } catch (error) {
      logger.error(TAG, `getTrustedDeviceListSync throw error,  error.code=${JSON.stringify(error.code)} , errorMessage=${error.message}`)
    }
    this.callback()
    logger.info(TAG, `getTrustedDeviceListSync end, callback finished`)
    try {
      this.deviceManager.on('deviceStateChange', (data) => {
        logger.info(TAG, `deviceStateChange data=${JSON.stringify(data)}`)
        switch (data.action) {
          case deviceManager.DeviceStateChangeAction.READY:
            this.discoverList = []
            this.deviceList.push(data.device)
            logger.info(TAG, `ready, updated device list=${JSON.stringify(this.deviceList)}`)
            try {
              let list = this.deviceManager.getTrustedDeviceListSync()
              logger.info(TAG, `getTrustedDeviceListSync end, deviceList=${JSON.stringify(list)}`)
              if (typeof (list) !== 'undefined' && typeof (list.length) !== 'undefined') {
                this.deviceList = list
              }
            } catch (error) {
              logger.error(TAG, `deviceStateChange throw error,  error.code=${JSON.stringify(error.code)} , errorMessage=${error.message}`)
            }
            this.callback()
            break
          case deviceManager.DeviceStateChangeAction.OFFLINE:
            if (this.deviceList.length > 0) {
              let list = []
              for (let j = 0; j < this.deviceList.length; j++) {
                if (this.deviceList[j].deviceId !== data.device.deviceId) {
                  list[j] = data.device
                }
              }
              this.deviceList = list
            }
            logger.info(TAG, `offline, updated device list=${JSON.stringify(data.device)}`)
            this.callback()
            break
          default:
            break
        }
      })
      this.deviceManager.on('deviceFound', (data) => {
        logger.info(TAG, `deviceFound data=${JSON.stringify(data)}`)
        logger.info(TAG, `deviceFound this.discoverList=${this.discoverList}`)
        for (let i = 0; i < this.discoverList.length; i++) {
          if (this.discoverList[i].deviceId === data.device.deviceId) {
            logger.info(TAG, `device founded ignored`)
            return
          }
        }
        this.discoverList[this.discoverList.length] = data.device
        logger.info(TAG, `deviceFound this.discoverList=${this.discoverList}`)
        this.callback()
      })
      this.deviceManager.on('discoverFail', (data) => {
        logger.info(TAG, `discoverFail data=${JSON.stringify(data)}`)
      })
      this.deviceManager.on('serviceDie', () => {
        logger.error(TAG, `serviceDie`)
      })
    } catch (error) {
      logger.error(TAG, `on throw error,  error.code=${JSON.stringify(error)}`)
    }

    SUBSCRIBE_ID = Math.floor(65536 * Math.random()) // Generate a random number
    let info = {
      subscribeId: SUBSCRIBE_ID,
      mode: 0xAA,
      medium: 2,
      freq: 2,
      isSameAccount: false,
      isWakeRemote: true,
      capability: 0
    }
    logger.debug(TAG, `startDeviceDiscovery ${SUBSCRIBE_ID}`)
    try {
      this.deviceManager.startDeviceDiscovery(info)
    } catch (error) {
      logger.error(TAG, `startDeviceDiscovery throw error,  error.code=${JSON.stringify(error.code)} , errorMessage=${error.message}`)
    }
  }

  unregisterDeviceListCallback() {
    logger.debug(TAG, `stopDeviceDiscovery ${SUBSCRIBE_ID}`)
    if (this.deviceManager === undefined) {
      return
    }
    try {
      this.deviceManager.stopDeviceDiscovery(SUBSCRIBE_ID)
      this.deviceManager.off('deviceStateChange')
      this.deviceManager.off('deviceFound')
      this.deviceManager.off('discoverFail')
      this.deviceManager.off('serviceDie')
      this.deviceList = []
    } catch (error) {
      logger.error(TAG, `throw error, error.code=${JSON.stringify(error.code)} , errorMessage=${error.message}`)
    }
  }

  authenticateDevice(device, callBack) {
    logger.debug(TAG, `authenticateDevice ${JSON.stringify(device)}`)
    for (let i = 0; i < this.discoverList.length; i++) {
      if (this.discoverList[i].deviceId === device.deviceId) {
        let extraInfo = {
          'targetPkgName': 'ohos.samples.distributedcalc',
          'appName': 'Distributed Calc',
          'appDescription': 'Distributed Calc',
          'business': '0'
        }
        let authParam = {
          'authType': 1,
          'extraInfo': extraInfo
        }
        if (this.deviceManager === undefined) {
          return
        }
        try {
          this.deviceManager.authenticateDevice(device, authParam, (err, data) => {
            if (err) {
              logger.error(TAG, `authenticateDevice error.code=${JSON.stringify(err.code)} , errorMessage=${err.message}`)
              this.authCallback = null
              return
            }
            logger.info(TAG, `authenticateDevice succeed:${JSON.stringify(data)}`)
            this.authCallback = callBack
          })
        } catch (error) {
          logger.error(TAG, `authenticateDevice throw error.code=${JSON.stringify(error.code)} , errorMessage=${error.message}`)
        }
      }
    }
  }
}