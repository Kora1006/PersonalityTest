import { useState, useCallback } from 'react'
import { View, Text, ScrollView, Input } from '@tarojs/components'
import Taro, { useLoad, useShow } from '@tarojs/taro'
import { DISC_COLORS } from '../../data/disc-colors'
import { storage } from '../../utils/storage'
import { quizStore } from '../../utils/quiz-store'
import type { HistoryRecord } from '../../utils/storage'
import './index.scss'

const TYPE_COLORS: Record<string, string> = {
  D: '#ef4444',
  I: '#f59e0b',
  S: '#10b981',
  C: '#3b82f6',
}

export default function History() {
  const [records, setRecords] = useState<HistoryRecord[]>([])
  const [search, setSearch] = useState('')

  const loadRecords = useCallback(() => {
    setRecords(storage.getHistory())
  }, [])

  useLoad(() => {
    Taro.setNavigationBarTitle({ title: '历史记录' })
    loadRecords()
  })

  useShow(() => {
    loadRecords()
  })

  const filtered = records.filter((r) => {
    if (!search) return true
    const q = search.toLowerCase()
    const color = DISC_COLORS[r.dominantType]
    return (
      r.dominantType.toLowerCase().includes(q) ||
      color.label.includes(q) ||
      r.date.includes(q) ||
      r.note.toLowerCase().includes(q)
    )
  })

  const handleView = (record: HistoryRecord) => {
    quizStore.setLastResult(record)
    Taro.navigateTo({ url: '/pages/result/index' })
  }

  const handleDelete = (id: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          storage.deleteHistoryRecord(id)
          setRecords((prev) => prev.filter((r) => r.id !== id))
        }
      },
    })
  }

  return (
    <View className="history-page">
      {/* Search */}
      <View className="search-bar">
        <Text className="search-icon">🔍</Text>
        <Input
          className="search-input"
          placeholder="搜索类型、日期..."
          placeholderClass="search-placeholder"
          value={search}
          onInput={(e) => setSearch(e.detail.value)}
        />
        {search ? (
          <Text className="search-clear" onClick={() => setSearch('')}>✕</Text>
        ) : null}
      </View>

      <ScrollView className="records-list" scrollY>
        {filtered.length === 0 ? (
          <View className="empty-state">
            <Text className="empty-icon">📋</Text>
            <Text className="empty-title">{search ? '没有匹配的记录' : '还没有测评记录'}</Text>
            <Text className="empty-desc">
              {search ? '换个关键词试试' : '完成一次测评，结果将自动保存在这里'}
            </Text>
            {!search && (
              <View
                className="start-btn"
                onClick={() => {
                  quizStore.reset()
                  Taro.navigateTo({ url: '/pages/quiz/index' })
                }}
              >
                <Text className="start-btn-text">开始测评</Text>
              </View>
            )}
          </View>
        ) : (
          filtered.map((record) => {
            const color = DISC_COLORS[record.dominantType]
            const typeColor = TYPE_COLORS[record.dominantType]
            return (
              <View className="record-card" key={record.id}>
                <View className="record-header">
                  <View className="type-badge" style={{ backgroundColor: `${typeColor}20` }}>
                    <Text className="type-letter" style={{ color: typeColor }}>
                      {record.dominantType}
                    </Text>
                  </View>
                  <View className="record-meta">
                    <Text className="record-type-name">{color.label}</Text>
                    <Text className="record-date">{record.date}</Text>
                  </View>
                  <View className="delete-btn" onClick={() => handleDelete(record.id)}>
                    <Text className="delete-icon">🗑</Text>
                  </View>
                </View>

                {/* Mini score bars */}
                <View className="mini-scores">
                  {(['D', 'I', 'S', 'C'] as const).map((t) => (
                    <View className="mini-bar-row" key={t}>
                      <Text className="mini-label" style={{ color: TYPE_COLORS[t] }}>{t}</Text>
                      <View className="mini-bar-bg">
                        <View
                          className="mini-bar-fill"
                          style={{ width: `${record.scores[t]}%`, backgroundColor: TYPE_COLORS[t] }}
                        />
                      </View>
                      <Text className="mini-pct">{record.scores[t]}%</Text>
                    </View>
                  ))}
                </View>

                <View className="view-btn" onClick={() => handleView(record)}>
                  <Text className="view-btn-text">查看结果 →</Text>
                </View>
              </View>
            )
          })
        )}
        <View style={{ height: '40rpx' }} />
      </ScrollView>
    </View>
  )
}
