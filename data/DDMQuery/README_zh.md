# 分布式数据管理结果集与谓词查询

### 简介

本示例展示了分布式数据管理中，如何通过构建query对象， 查询kvstore中的数据，获取结果集。

### 使用说明

1.点击**添加数据**，将模板数据存入数据库

2.点击**查询指定字段结果集**，从数据库中查询包含指定key字段的结果集

3.点击**查询指定值条目**，通过谓词从数据库中查询包含指定key字段的结果集

4.点击**与条件查询**，通过谓词从数据库中查询FieldNode对应的值不为特定值的结果集

5.点击**查询結果降序**，通过谓词从数据库中查询FieldNode对应的值不为特定值且降序排序的结果集

6.点击**查询小于指定值**，通过谓词从数据库中查询FieldNode对应的值小于特定值的键值对列表

### 约束与限制

本示例仅支持在标准系统上运行。