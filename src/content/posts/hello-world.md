---
title: hello word
published: 2026-10-22
description: 欢迎来到张某人的博客
image: ''
tags:
  - 随笔
category: 生活
draft: false
---

## 开篇

这个博客用于记录我作为芯片验证工程师的一些随笔——验证方法学、SystemVerilog / UVM 的踩坑记录、工具链折腾笔记，以及偶尔与技术无关的想法。

## 验证代码示例

```systemverilog
class my_transaction extends uvm_sequence_item;
    rand bit [31:0] addr;
    rand bit [31:0] data;

    constraint addr_c { addr inside {[32'h0000_0000 : 32'h0000_FFFF]}; }

    `uvm_object_utils_begin(my_transaction)
        `uvm_field_int(addr, UVM_ALL_ON)
        `uvm_field_int(data, UVM_ALL_ON)
    `uvm_object_utils_end
endclass
```

后续慢慢写。
