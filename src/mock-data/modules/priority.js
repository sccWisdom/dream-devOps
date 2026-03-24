export function getPriorityList() {
  return Promise.resolve([
    {
      id: '1',
      name: 'P0',
      color: '#d32f2f',
      level: 'P0',
      enabled: true,
      desc: '特级紧急'
    },
    {
      id: '2',
      name: 'P3',
      color: '#16a34a',
      level: 'P3',
      enabled: true,
      desc: '三级一般'
    },
    {
      id: '3',
      name: 'P2',
      color: '#f59e0b',
      level: 'P2',
      enabled: true,
      desc: '二级重要'
    },
    {
      id: '4',
      name: 'P1',
      color: '#ef4444',
      level: 'P1',
      enabled: true,
      desc: '一级严重'
    }
  ])
}

