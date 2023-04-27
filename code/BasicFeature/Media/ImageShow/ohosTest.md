# ImageShow 测试用例归档

## 用例表

|测试功能|预置条件|输入|预期输出|测试结果|
|--------------------------------|--------------------------------|--------------------------------|--------------------------------|--------------------------------|
|打开相机|设备中存在相机系统应用|拉起相机|相机启动成功|Pass|
|拍摄图片|相机启动成功|拍摄三张图片|图片拍摄成功|Pass|
|拉起应用|sample安装成功|启动应用|应用启动成功，弹出授权弹窗|Pass|
|授权|授权弹窗弹出成功|点击允许|授权成功|Pass|
|评论|首页展示正常|输入评论内容|评论文本与输入内容一致|Pass|
|跳转到选择图片页面|进入首页|选择三张图片|图片选择成功，图片上出现数字角标，下方按照顺序排列好已经选择的图片|Pass|
|删除图片|图片选择成功|点击下方图片中的删除按钮|图片删除成功|Pass|
|首页图片列表展示|选择图片页面“下一步”按钮显示正常|点击“下一步”|回到首页，首页图片列表展示正常，数量符合预期|Pass|