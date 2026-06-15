import { useState } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { storage } from '../../utils/storage'
import { api } from '../../utils/request'
import './index.scss'

type Tab = 'login' | 'register'

export default function Auth() {
  const [tab, setTab] = useState<Tab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(() => storage.getUser())

  useLoad(() => {
    Taro.setNavigationBarTitle({ title: '我的' })
    setUser(storage.getUser())
  })

  const handleLogin = async () => {
    if (!email || !password) {
      Taro.showToast({ title: '请填写邮箱和密码', icon: 'none' })
      return
    }
    setLoading(true)
    try {
      const res = await api.post<{ token: string; user: { id: string; name: string; email: string } }>(
        '/api/auth/sign-in/email',
        { email, password },
        false
      )
      storage.setToken(res.token)
      storage.setUser(res.user)
      setUser(res.user)
      Taro.showToast({ title: '登录成功', icon: 'success' })
    } catch {
      Taro.showToast({ title: '登录失败，请检查账号密码', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }
    if (password.length < 6) {
      Taro.showToast({ title: '密码至少 6 位', icon: 'none' })
      return
    }
    setLoading(true)
    try {
      const res = await api.post<{ token: string; user: { id: string; name: string; email: string } }>(
        '/api/auth/sign-up/email',
        { email, password, name },
        false
      )
      storage.setToken(res.token)
      storage.setUser(res.user)
      setUser(res.user)
      Taro.showToast({ title: '注册成功', icon: 'success' })
    } catch {
      Taro.showToast({ title: '注册失败，邮箱可能已被使用', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleWechatLogin = () => {
    Taro.login({
      success: async (loginRes) => {
        if (!loginRes.code) return
        setLoading(true)
        try {
          const res = await api.post<{ token: string; user: { id: string; name: string; email: string } }>(
            '/api/auth/wechat/miniprogram-login',
            { code: loginRes.code },
            false
          )
          storage.setToken(res.token)
          storage.setUser(res.user)
          setUser(res.user)
          Taro.showToast({ title: '微信登录成功', icon: 'success' })
        } catch {
          Taro.showToast({ title: '微信登录失败', icon: 'none' })
        } finally {
          setLoading(false)
        }
      },
    })
  }

  const handleLogout = () => {
    Taro.showModal({
      title: '确认退出',
      content: '退出登录后，历史记录仅保存在本地',
      success: (res) => {
        if (res.confirm) {
          storage.clearToken()
          setUser(null)
          Taro.showToast({ title: '已退出登录', icon: 'success' })
        }
      },
    })
  }

  // Logged in state
  if (user) {
    return (
      <ScrollView className="auth-page" scrollY>
        <View className="profile-section">
          <View className="avatar">
            <Text className="avatar-text">{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text className="profile-name">{user.name}</Text>
          <Text className="profile-email">{user.email}</Text>
        </View>

        <View className="menu-section">
          <View className="menu-item">
            <Text className="menu-label">云端历史记录</Text>
            <Text className="menu-arrow">→</Text>
          </View>
          <View className="menu-item">
            <Text className="menu-label">账号设置</Text>
            <Text className="menu-arrow">→</Text>
          </View>
          <View className="menu-item" onClick={() => Taro.navigateTo({ url: '/pages/privacy/index' })}>
            <Text className="menu-label">隐私政策</Text>
            <Text className="menu-arrow">→</Text>
          </View>
          <View className="menu-item" onClick={() => Taro.navigateTo({ url: '/pages/terms/index' })}>
            <Text className="menu-label">用户协议</Text>
            <Text className="menu-arrow">→</Text>
          </View>
        </View>

        <View className="logout-btn" onClick={handleLogout}>
          <Text className="logout-text">退出登录</Text>
        </View>
      </ScrollView>
    )
  }

  // Not logged in
  return (
    <ScrollView className="auth-page" scrollY>
      <View className="auth-header">
        <Text className="auth-title">欢迎使用</Text>
        <Text className="auth-subtitle">登录后可云端同步测评历史，跨设备访问</Text>
      </View>

      {/* Tab Switch */}
      <View className="tab-bar">
        <View
          className={`tab-item ${tab === 'login' ? 'tab-active' : ''}`}
          onClick={() => setTab('login')}
        >
          <Text className="tab-text">登录</Text>
        </View>
        <View
          className={`tab-item ${tab === 'register' ? 'tab-active' : ''}`}
          onClick={() => setTab('register')}
        >
          <Text className="tab-text">注册</Text>
        </View>
      </View>

      {/* Form */}
      <View className="form-section">
        {tab === 'register' && (
          <View className="form-field">
            <Text className="field-label">昵称</Text>
            <Input
              className="field-input"
              placeholder="请输入你的昵称"
              placeholderClass="field-placeholder"
              value={name}
              onInput={(e) => setName(e.detail.value)}
            />
          </View>
        )}

        <View className="form-field">
          <Text className="field-label">邮箱</Text>
          <Input
            className="field-input"
            placeholder="请输入邮箱"
            placeholderClass="field-placeholder"
            type="text"
            value={email}
            onInput={(e) => setEmail(e.detail.value)}
          />
        </View>

        <View className="form-field">
          <Text className="field-label">密码</Text>
          <Input
            className="field-input"
            password
            placeholder={tab === 'register' ? '至少 6 位，包含字母和数字' : '请输入密码'}
            placeholderClass="field-placeholder"
            value={password}
            onInput={(e) => setPassword(e.detail.value)}
          />
        </View>

        <View
          className={`submit-btn ${loading ? 'submit-disabled' : ''}`}
          onClick={loading ? undefined : tab === 'login' ? handleLogin : handleRegister}
        >
          <Text className="submit-text">{loading ? '请稍候...' : tab === 'login' ? '登录' : '注册'}</Text>
        </View>
      </View>

      {/* WeChat Login */}
      <View className="divider">
        <View className="divider-line" />
        <Text className="divider-text">或</Text>
        <View className="divider-line" />
      </View>

      <View className="wechat-btn" onClick={loading ? undefined : handleWechatLogin}>
        <Text className="wechat-text">微信一键登录</Text>
      </View>

      <View className="terms-note">
        <Text className="terms-text">
          登录即同意{' '}
          <Text
            className="terms-link"
            onClick={() => Taro.navigateTo({ url: '/pages/terms/index' })}
          >
            用户协议
          </Text>
          {' '}和{' '}
          <Text
            className="terms-link"
            onClick={() => Taro.navigateTo({ url: '/pages/privacy/index' })}
          >
            隐私政策
          </Text>
        </Text>
      </View>
    </ScrollView>
  )
}
