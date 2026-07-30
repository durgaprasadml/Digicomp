import { useState } from 'react'
import { useLocation, useNavigate, Link } from '@typeroute/router'
import { Tabs, Button, toast, Checkbox, TextField, Label, Input, Card } from '@heroui/react'

import { Container, Stack, Honeypot } from '../components'
import { UserStore } from '../stores/UserStore'
import { login, register } from '../utils/api'
import { login as loginRoute, signup as signupRoute, home } from '../routes'

function LoginForm({ onSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [phoneWebsite, setPhoneWebsite] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    const res = await login(username, password, remember, phoneWebsite)
    setIsLoading(false)

    if (res && res.success) {
      toast.success(res.message || 'Logged in successfully')
      // Update UserStore to trigger app re-render
      await UserStore.refreshData()
      if (onSuccess) onSuccess()
    } else {
      toast.danger(res?.message || 'Login failed')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField isRequired value={username} onChange={setUsername} name="username" className="flex flex-col gap-2">
        <Label>Username or Email</Label>
        <Input variant="secondary" className="w-full" />
      </TextField>
      <TextField isRequired value={password} onChange={setPassword} name="password" type="password" className="flex flex-col gap-2">
        <Label>Password</Label>
        <Input variant="secondary" type="password" className="w-full" />
      </TextField>
      <Honeypot value={phoneWebsite} onChange={setPhoneWebsite} />
      <Checkbox isSelected={remember} onChange={setRemember} variant="secondary">
        <Checkbox.Content>
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          <span>Remember me</span>
        </Checkbox.Content>
      </Checkbox>
      <Button type="submit" variant="primary" className="w-full" isPending={isLoading}>
        Log in
      </Button>
    </form>
  )
}

function SignupForm({ onSuccess }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [phoneWebsite, setPhoneWebsite] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    const res = await register(username, email, phoneWebsite)
    setIsLoading(false)

    if (res && res.success) {
      toast.success(res.message || 'Registration successful. Check your email.')
      if (onSuccess) onSuccess()
    } else {
      toast.danger(res?.message || 'Registration failed')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField isRequired value={username} onChange={setUsername} name="username" className="flex flex-col gap-2">
        <Label>Username</Label>
        <Input variant="secondary" className="w-full" />
      </TextField>
      <TextField isRequired value={email} onChange={setEmail} name="email" type="email" className="flex flex-col gap-2">
        <Label>Email Address</Label>
        <Input variant="secondary" type="email" className="w-full" />
      </TextField>
      <Honeypot value={phoneWebsite} onChange={setPhoneWebsite} />
      <Button type="submit" variant="primary" className="w-full" isPending={isLoading}>
        Sign up
      </Button>
      <p className="text-xs text-center">
        A password will be sent to your email address.
      </p>
    </form>
  )
}

// Reusable Tabs Component for both Page and Modal
export function AuthTabs({ defaultTab = 'login', onSuccess }) {
  const [selected, setSelected] = useState(defaultTab)

  return (
    <Tabs selectedKey={selected} onSelectionChange={setSelected} className="w-full">
      <Tabs.ListContainer>
        <Tabs.List aria-label="Authentication Options">
          <Tabs.Tab id="login" >
            Login
            <Tabs.Indicator />
          </Tabs.Tab>
          <Tabs.Tab id="signup" >
            Sign Up
            <Tabs.Indicator />
          </Tabs.Tab>
        </Tabs.List>
      </Tabs.ListContainer>
      <Tabs.Panel id="login">
        <LoginForm onSuccess={onSuccess} />
      </Tabs.Panel>
      <Tabs.Panel id="signup">
        <SignupForm onSuccess={onSuccess} />
      </Tabs.Panel>
    </Tabs>
  )
}

// Dedicated Page Component
export default function AuthPage() {
  const { path, state } = useLocation()
  const navigate = useNavigate()
  const { user } = UserStore.use()

  // If already logged in, redirect to home
  if (user?.is_logged_in) {
    navigate({ to: home })
    return null
  }

  const activeTab = path.includes('/signup') ? 'signup' : 'login'

  const handleSuccess = () => {
    const redirectTo = state?.from || home
    navigate({ to: redirectTo })
  }

  return (
    <Container className="py-12 max-w-md">
      <Card>
        <Stack spacing={6}>
          <div className="text-center">
            <h2>Welcome back</h2>
            <p>Please enter your details to continue.</p>
          </div>
          <AuthTabs defaultTab={activeTab} onSuccess={handleSuccess} />
        </Stack>
      </Card>
    </Container>
  )
}
