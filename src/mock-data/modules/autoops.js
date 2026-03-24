export function getRules() {
  return Promise.resolve([
    {
      id: '1',
      name: '磁盘告警自愈',
      trigger: '磁盘使用率>90%',
      condition: '时间范围 00:00-24:00',
      action: '清理临时文件',
      fallback: '发送告警通知',
      scope: '应用服务器',
      status: '灰度',
      description: '当磁盘使用率超过90%时，自动清理临时文件',
      createTime: '2026-03-02 14:30:00',
      updateTime: '2026-03-02 14:30:00'
    },
    {
      id: '2',
      name: '内存告警处理',
      trigger: '内存使用率>90%并且持续时间超过3分钟',
      condition: '时间范围 00:00-24:00',
      action: '重启应用服务',
      fallback: '发送告警通知',
      scope: '应用服务器',
      status: '停用',
      description: '当内存使用率超过90%并且持续时间超过3分钟时，自动重启服务',
      createTime: '2026-03-03 09:15:00',
      updateTime: '2026-03-03 09:15:00'
    },
    {
      id: '3',
      name: '治理任务报错处置',
      trigger: '报错日志包括“Out of space”',
      condition: '时间范围 00:00-24:00',
      action: '重跑治理任务',
      fallback: '发送告警通知',
      scope: '数据开发子系统',
      status: '启用',
      description: '当治理任务报错包括“Out of space”时，尝试自动重跑治理任务',
      createTime: '2026-03-04 16:45:00',
      updateTime: '2026-03-04 16:45:00'
    },
    {
      id: '4',
      name: '归集任务报错处置',
      trigger: '报错日志包括“Can\' connect to MySQL server on \'172.27.222.20\' (110)””',
      condition: '时间范围 00:00-24:00',
      action: '重跑归集任务',
      fallback: '发送告警通知',
      scope: '数据归集子系统',
      status: '启用',
      description: '当归集任务报错包括“Can\' connect to MySQL server on \'172.27.222.20\' (110)””时，尝试自动重跑归集任务',
      createTime: '2026-03-19 09:15:00',
      updateTime: '2026-03-19 09:15:00'
    },
    {
      id: '5',
      name: '共享任务报错处置',
      trigger: '报错日志包括“Redis Error”',
      condition: '时间范围 00:00-24:00',
      action: '重跑共享任务',
      fallback: '发送告警通知',
      scope: '数据共享子系统',
      status: '启用',
      description: '当共享任务报错包括“Redis Error”时，尝试自动重跑共享任务',
      createTime: '2026-03-19 09:15:00',
      updateTime: '2026-03-19 09:15:00'
    }
  ])
}

export function getScripts() {
  return Promise.resolve([
    {
      id: '1',
      name: 'restart-service.sh',
      type: 'Shell',
      version: '1.2.0',
      description: '重启服务脚本',
      content: '#!/bin/bash\necho "Restarting service..."\nsystemctl restart myservice\necho "Service restarted"',
      createTime: '2026-03-01 10:00:00',
      updateTime: '2026-03-01 10:00:00'
    },
    {
      id: '2',
      name: 'purge-temp.py',
      type: 'Python',
      version: '0.9.1',
      description: '清理临时文件脚本',
      content: '#!/usr/bin/env python3\nimport os\nimport shutil\n\ndef purge_temp():\n    temp_dir = "/tmp"\n    print(f"Purging {temp_dir}...")\n    for item in os.listdir(temp_dir):\n        item_path = os.path.join(temp_dir, item)\n        try:\n            if os.path.isfile(item_path):\n                os.unlink(item_path)\n            elif os.path.isdir(item_path):\n                shutil.rmtree(item_path)\n        except Exception as e:\n            print(f"Error: {e}")\n    print("Purge completed")\n\nif __name__ == "__main__":\n    purge_temp()',
      createTime: '2026-03-02 14:30:00',
      updateTime: '2026-03-02 14:30:00'
    },
    {
      id: '3',
      name: 'check-disk.bat',
      type: 'Bat',
      version: '1.0.0',
      description: '检查磁盘空间脚本',
      content: '@echo off\necho Checking disk space...\ndir C:\\ /s\necho Check completed',
      createTime: '2026-03-03 09:15:00',
      updateTime: '2026-03-03 09:15:00'
    }
  ])
}

export function getExecutionHistory() {
  return Promise.resolve([
    {
      id: '1',
      ruleName: '治理任务报错处置',
      triggerTime: '2026-03-19 08:30:00',
      executeTime: '2026-03-19 08:30:05',
      status: '成功',
      duration: '5s',
      operator: 'wsupport',
      result: 'Task successfully rerun'
    },
    {
      id: '2',
      ruleName: '磁盘告警自愈',
      triggerTime: '2026-03-19 10:15:00',
      executeTime: '2026-03-19 10:15:05',
      status: '成功',
      duration: '8s',
      operator: 'wsupport',
      result: 'Cleaned 2GB of temporary files'
    },
    {
      id: '3',
      ruleName: '内存告警处理',
      triggerTime: '2026-03-19 12:45:00',
      executeTime: '2026-03-19 12:45:05',
      status: '失败',
      duration: '10s',
      operator: 'wsupport',
      result: 'Failed to restart service: Permission denied'
    },
    {
      id: '4',
      ruleName: '共享任务报错处置',
      triggerTime: '2026-03-19 14:20:00',
      executeTime: '2026-03-19 14:20:05',
      status: '成功',
      duration: '4s',
      operator: 'wsupport',
      result: 'Task successfully rerun'
    },
    {
      id: '5',
      ruleName: '磁盘告警自愈',
      triggerTime: '2026-03-19 16:50:00',
      executeTime: '2026-03-19 16:50:05',
      status: '执行中',
      duration: '2s',
      operator: 'wsupport',
      result: 'Cleaning temporary files...'
    }
  ])
}

export function getStatistics() {
  return Promise.resolve({
    todayExecutions: 15,
    todaySuccess: 12,
    todayFailed: 3,
    todayAlerts: 25,
    todayAutoHandledAlerts: 18,
    todayAutoHandledSuccess: 15,
    todayAutoHandledFailed: 3,
    automationRate: 83.33,
    automationRateChange: +2
  })
}
