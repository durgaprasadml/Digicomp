import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from '@typeroute/router'
import { Button, toast, Checkbox } from '@heroui/react'
import { Eye, EyeOff, Phone, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'

import { Container, Stack, Honeypot, Logo } from '../components'
import { UserStore } from '../stores/UserStore'
import { login, register, forgotPassword, loginWithGoogle, sendPhoneOtp, verifyPhoneOtp } from '../utils/api'
import { home } from '../routes'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

// Google G Icon
function GoogleIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  )
}

function SocialAndPhoneDivider() {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-surface px-3 text-muted tracking-wider font-medium">OR</span>
      </div>
    </div>
  )
}

function GoogleSignInButton({ onGoogleSuccess, isPending, setIsPending }) {
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return

    // Dynamically inject Google Identity Services SDK if configured
    if (!document.getElementById('google-gsi-client')) {
      const script = document.createElement('script')
      script.id = 'google-gsi-client'
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      document.body.appendChild(script)
    }
  }, [])

  const handleGoogleClick = () => {
    if (!GOOGLE_CLIENT_ID) {
      toast.danger('Google Sign-In is not configured yet. Please configure VITE_GOOGLE_CLIENT_ID in your environment.')
      return
    }

    if (window.google?.accounts?.id) {
      try {
        setIsPending(true)
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            if (response.credential) {
              const res = await loginWithGoogle(response.credential)
              if (res && res.success) {
                toast.success(res.message || 'Signed in with Google successfully')
                await UserStore.refreshData()
                if (onGoogleSuccess) onGoogleSuccess()
              } else {
                toast.danger(res?.message || 'Google sign-in failed. Please try again.')
              }
            }
            setIsPending(false)
          },
        })
        window.google.accounts.id.prompt()
      } catch {
        setIsPending(false)
        toast.danger('Unable to launch Google authentication dialog.')
      }
    } else {
      toast.danger('Loading Google Sign-In service. Please try again in a moment.')
    }
  }

  return (
    <button
      type="button"
      id="btn-continue-google"
      onClick={handleGoogleClick}
      disabled={isPending}
      className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-border bg-surface hover:bg-default/60 active:scale-[0.99] text-foreground text-sm font-medium transition-all shadow-xs cursor-pointer disabled:opacity-60"
    >
      <GoogleIcon />
      <span>{isPending ? 'Connecting to Google...' : 'Continue with Google'}</span>
    </button>
  )
}

function LoginForm({ onSuccess, onSwitchToSignup, onSwitchToForgot, onSwitchToPhone }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [phoneWebsite, setPhoneWebsite] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    const cleanUser = username.trim()
    if (!cleanUser) {
      setErrorMessage('Please enter your email or username.')
      return
    }
    if (!password) {
      setErrorMessage('Password is required.')
      return
    }

    setIsLoading(true)
    const res = await login(cleanUser, password, remember, phoneWebsite)
    setIsLoading(false)

    if (res && res.success) {
      toast.success(res.message || 'Logged in successfully')
      await UserStore.refreshData()
      if (onSuccess) onSuccess()
    } else {
      const msg = res?.message || 'Incorrect email or password.'
      setErrorMessage(msg)
      toast.danger(msg)
    }
  }

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs flex items-start gap-2 animate-fade-in-up">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        {/* Email or Username */}
        <div className="space-y-1.5">
          <label htmlFor="login-username" className="block text-xs font-semibold text-foreground">
            Email address
          </label>
          <div className="relative flex items-center">
            <input
              id="login-username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                if (errorMessage) setErrorMessage('')
              }}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-border focus:border-accent text-sm text-foreground placeholder:text-muted/60 outline-none transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="block text-xs font-semibold text-foreground">
              Password
            </label>
            <button
              type="button"
              onClick={onSwitchToForgot}
              className="text-xs text-accent hover:underline cursor-pointer font-medium"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative flex items-center">
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errorMessage) setErrorMessage('')
              }}
              placeholder="Enter your password"
              className="w-full pl-3.5 pr-11 py-2.5 bg-surface rounded-xl border border-border focus:border-accent text-sm text-foreground placeholder:text-muted/60 outline-none transition-all shadow-xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 p-1 text-muted hover:text-foreground transition-colors cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Honeypot value={phoneWebsite} onChange={setPhoneWebsite} />

        {/* Remember me checkbox */}
        <div className="flex items-center justify-between pt-1">
          <Checkbox isSelected={remember} onChange={setRemember} variant="secondary">
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <span className="text-xs text-muted">Remember me</span>
            </Checkbox.Content>
          </Checkbox>
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          variant="primary"
          className="w-full py-2.5 rounded-xl font-semibold text-sm cursor-pointer shadow-sm"
          isPending={isLoading}
        >
          {isLoading ? 'Signing you in...' : 'Sign In'}
        </Button>
      </form>

      <SocialAndPhoneDivider />

      {/* Social / Alternative Sign-in buttons */}
      <div className="space-y-2.5">
        <GoogleSignInButton
          onGoogleSuccess={onSuccess}
          isPending={isGoogleLoading}
          setIsPending={setIsGoogleLoading}
        />

        <button
          type="button"
          id="btn-continue-phone"
          onClick={onSwitchToPhone}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-border bg-surface hover:bg-default/60 active:scale-[0.99] text-foreground text-sm font-medium transition-all shadow-xs cursor-pointer"
        >
          <Phone className="w-4 h-4 text-accent" />
          <span>Continue with Phone</span>
        </button>
      </div>

      {/* Switch to signup */}
      <div className="pt-2 text-center text-xs text-muted">
        <span>Don't have an account? </span>
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-accent font-semibold hover:underline cursor-pointer ml-1"
        >
          Create account
        </button>
      </div>
    </div>
  )
}

function SignupForm({ onSuccess, onSwitchToLogin, onSwitchToPhone }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [phoneWebsite, setPhoneWebsite] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    const cleanName = name.trim()
    const cleanEmail = email.trim()

    if (!cleanName) {
      setErrorMessage('Full name is required.')
      return
    }
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.')
      return
    }
    if (!password) {
      setErrorMessage('Password is required.')
      return
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    setIsLoading(true)
    const res = await register({
      name: cleanName,
      email: cleanEmail,
      password,
      phoneWebsite,
    })
    setIsLoading(false)

    if (res && res.success) {
      toast.success(res.message || 'Account created successfully')
      await UserStore.refreshData()
      if (onSuccess) onSuccess()
    } else {
      const msg = res?.message || 'Unable to create account. Please try again.'
      setErrorMessage(msg)
      toast.danger(msg)
    }
  }

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs flex items-start gap-2 animate-fade-in-up">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        {/* Full Name */}
        <div className="space-y-1.5">
          <label htmlFor="signup-name" className="block text-xs font-semibold text-foreground">
            Full name
          </label>
          <div className="relative flex items-center">
            <input
              id="signup-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errorMessage) setErrorMessage('')
              }}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-border focus:border-accent text-sm text-foreground placeholder:text-muted/60 outline-none transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <label htmlFor="signup-email" className="block text-xs font-semibold text-foreground">
            Email address
          </label>
          <div className="relative flex items-center">
            <input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errorMessage) setErrorMessage('')
              }}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-border focus:border-accent text-sm text-foreground placeholder:text-muted/60 outline-none transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="signup-password" className="block text-xs font-semibold text-foreground">
            Password
          </label>
          <div className="relative flex items-center">
            <input
              id="signup-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errorMessage) setErrorMessage('')
              }}
              placeholder="At least 6 characters"
              className="w-full pl-3.5 pr-11 py-2.5 bg-surface rounded-xl border border-border focus:border-accent text-sm text-foreground placeholder:text-muted/60 outline-none transition-all shadow-xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 p-1 text-muted hover:text-foreground transition-colors cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label htmlFor="signup-confirm-password" className="block text-xs font-semibold text-foreground">
            Confirm password
          </label>
          <div className="relative flex items-center">
            <input
              id="signup-confirm-password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (errorMessage) setErrorMessage('')
              }}
              placeholder="Repeat your password"
              className="w-full pl-3.5 pr-11 py-2.5 bg-surface rounded-xl border border-border focus:border-accent text-sm text-foreground placeholder:text-muted/60 outline-none transition-all shadow-xs"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 p-1 text-muted hover:text-foreground transition-colors cursor-pointer"
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Honeypot value={phoneWebsite} onChange={setPhoneWebsite} />

        {/* Submit button */}
        <Button
          type="submit"
          variant="primary"
          className="w-full py-2.5 rounded-xl font-semibold text-sm cursor-pointer shadow-sm mt-1"
          isPending={isLoading}
        >
          {isLoading ? 'Creating your account...' : 'Create Account'}
        </Button>
      </form>

      <SocialAndPhoneDivider />

      {/* Social / Phone Buttons */}
      <div className="space-y-2.5">
        <GoogleSignInButton
          onGoogleSuccess={onSuccess}
          isPending={isGoogleLoading}
          setIsPending={setIsGoogleLoading}
        />

        <button
          type="button"
          onClick={onSwitchToPhone}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-border bg-surface hover:bg-default/60 active:scale-[0.99] text-foreground text-sm font-medium transition-all shadow-xs cursor-pointer"
        >
          <Phone className="w-4 h-4 text-accent" />
          <span>Continue with Phone</span>
        </button>
      </div>

      {/* Switch to login */}
      <div className="pt-2 text-center text-xs text-muted">
        <span>Already have an account? </span>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-accent font-semibold hover:underline cursor-pointer ml-1"
        >
          Sign in
        </button>
      </div>
    </div>
  )
}

function ForgotPasswordForm({ onBackToLogin }) {
  const [email, setEmail] = useState('')
  const [phoneWebsite, setPhoneWebsite] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    const cleanEmail = email.trim()
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.')
      return
    }

    setIsLoading(true)
    const res = await forgotPassword(cleanEmail, phoneWebsite)
    setIsLoading(false)

    if (res && res.success) {
      setIsSubmitted(true)
      toast.success('Password reset link requested')
    } else {
      const msg = res?.message || 'Something went wrong. Please try again.'
      setErrorMessage(msg)
      toast.danger(msg)
    }
  }

  if (isSubmitted) {
    return (
      <div className="space-y-5 text-center py-2 animate-fade-in-up">
        <div className="w-12 h-12 mx-auto rounded-full bg-success/10 text-success flex items-center justify-center border border-success/20">
          <CheckCircle className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h3 className="text-base font-bold text-foreground">Reset Link Sent</h3>
          <p className="text-xs text-muted leading-relaxed">
            If an account exists for <span className="font-semibold text-foreground">{email}</span>, you will receive instructions to reset your password shortly.
          </p>
        </div>
        <Button
          variant="secondary"
          className="w-full rounded-xl py-2.5 text-xs font-semibold cursor-pointer"
          onPress={onBackToLogin}
        >
          Back to Sign In
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted leading-relaxed">
        Enter your registered email address below and we'll send you a link to reset your password.
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        <div className="space-y-1.5">
          <label htmlFor="forgot-email" className="block text-xs font-semibold text-foreground">
            Email address
          </label>
          <input
            id="forgot-email"
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (errorMessage) setErrorMessage('')
            }}
            placeholder="name@example.com"
            className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-border focus:border-accent text-sm text-foreground placeholder:text-muted/60 outline-none transition-all shadow-xs"
          />
        </div>

        <Honeypot value={phoneWebsite} onChange={setPhoneWebsite} />

        <Button
          type="submit"
          variant="primary"
          className="w-full py-2.5 rounded-xl font-semibold text-sm cursor-pointer shadow-sm"
          isPending={isLoading}
        >
          {isLoading ? 'Sending reset request...' : 'Send Reset Link'}
        </Button>
      </form>

      <div className="pt-2 text-center text-xs text-muted">
        <span>Remember your password? </span>
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-accent font-semibold hover:underline cursor-pointer ml-1"
        >
          Back to Sign In
        </button>
      </div>
    </div>
  )
}

function PhoneOtpForm({ onSuccess, onBackToLogin }) {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('phone') // 'phone' | 'otp'
  const [isLoading, setIsLoading] = useState(false)
  const [notice, setNotice] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSendCode = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setNotice('')

    const cleanPhone = phone.trim()
    if (!cleanPhone || cleanPhone.length < 8) {
      setErrorMessage('Please enter a valid phone number.')
      return
    }

    setIsLoading(true)
    const res = await sendPhoneOtp(cleanPhone)
    setIsLoading(false)

    if (res && res.success) {
      setStep('otp')
      toast.success('Verification code sent')
    } else {
      // Clean, non-technical explanation
      const msg = res?.message || 'Phone OTP verification requires SMS provider credentials. Please sign in with Email or Google.'
      setNotice(msg)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!otp.trim()) {
      setErrorMessage('Please enter the verification code.')
      return
    }

    setIsLoading(true)
    const res = await verifyPhoneOtp(phone.trim(), otp.trim())
    setIsLoading(false)

    if (res && res.success) {
      toast.success('Phone verified successfully')
      await UserStore.refreshData()
      if (onSuccess) onSuccess()
    } else {
      setErrorMessage(res?.message || 'Invalid or expired verification code.')
    }
  }

  return (
    <div className="space-y-4">
      {notice && (
        <div className="p-3.5 rounded-xl bg-default/40 border border-border text-foreground text-xs space-y-2 animate-fade-in-up">
          <div className="flex items-start gap-2 text-warning">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-medium text-foreground">{notice}</span>
          </div>
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-xs text-accent font-semibold hover:underline cursor-pointer block"
          >
            ← Sign in with Email instead
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs flex items-start gap-2 animate-fade-in-up">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {step === 'phone' ? (
        <form onSubmit={handleSendCode} className="space-y-3.5">
          <div className="space-y-1.5">
            <label htmlFor="phone-input" className="block text-xs font-semibold text-foreground">
              Mobile phone number
            </label>
            <div className="relative flex items-center">
              <input
                id="phone-input"
                type="tel"
                autoComplete="tel"
                required
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  if (errorMessage) setErrorMessage('')
                  if (notice) setNotice('')
                }}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-border focus:border-accent text-sm text-foreground placeholder:text-muted/60 outline-none transition-all shadow-xs"
              />
            </div>
            <p className="text-[11px] text-muted">Include country code (e.g., +91 for India)</p>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-2.5 rounded-xl font-semibold text-sm cursor-pointer shadow-sm"
            isPending={isLoading}
          >
            {isLoading ? 'Sending code...' : 'Send Verification Code'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-3.5">
          <div className="space-y-1.5">
            <label htmlFor="otp-input" className="block text-xs font-semibold text-foreground">
              Enter 6-digit code sent to {phone}
            </label>
            <input
              id="otp-input"
              type="text"
              maxLength={6}
              autoComplete="one-time-code"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-border focus:border-accent text-center tracking-widest text-lg font-mono text-foreground placeholder:text-muted/60 outline-none transition-all shadow-xs"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-2.5 rounded-xl font-semibold text-sm cursor-pointer shadow-sm"
            isPending={isLoading}
          >
            {isLoading ? 'Verifying code...' : 'Verify & Continue'}
          </Button>
        </form>
      )}

      <div className="pt-2 text-center text-xs text-muted">
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-accent font-semibold hover:underline cursor-pointer flex items-center justify-center gap-1 mx-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </button>
      </div>
    </div>
  )
}

/**
 * Reusable AuthTabs Component for both Page and Modal view.
 */
export function AuthTabs({ defaultTab = 'login', onSuccess }) {
  const [activeMode, setActiveMode] = useState(defaultTab) // 'login' | 'signup' | 'forgot' | 'phone'

  useEffect(() => {
    setActiveMode(defaultTab)
  }, [defaultTab])

  const titles = {
    login: {
      title: 'Welcome back',
      subtitle: 'Sign in to your DigiComp account',
    },
    signup: {
      title: 'Create your account',
      subtitle: 'Join DigiComp for hardware, orders & AI assistance',
    },
    forgot: {
      title: 'Reset your password',
      subtitle: 'We will help you recover access to your account',
    },
    phone: {
      title: 'Phone Sign In',
      subtitle: 'Sign in quickly with mobile verification',
    },
  }

  const currentHeader = titles[activeMode] || titles.login

  return (
    <div className="w-full">
      {/* Header description */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-extrabold text-foreground tracking-tight">
          {currentHeader.title}
        </h2>
        <p className="text-xs text-muted mt-1">
          {currentHeader.subtitle}
        </p>
      </div>

      {/* Render active form */}
      {activeMode === 'login' && (
        <LoginForm
          onSuccess={onSuccess}
          onSwitchToSignup={() => setActiveMode('signup')}
          onSwitchToForgot={() => setActiveMode('forgot')}
          onSwitchToPhone={() => setActiveMode('phone')}
        />
      )}

      {activeMode === 'signup' && (
        <SignupForm
          onSuccess={onSuccess}
          onSwitchToLogin={() => setActiveMode('login')}
          onSwitchToPhone={() => setActiveMode('phone')}
        />
      )}

      {activeMode === 'forgot' && (
        <ForgotPasswordForm
          onBackToLogin={() => setActiveMode('login')}
        />
      )}

      {activeMode === 'phone' && (
        <PhoneOtpForm
          onSuccess={onSuccess}
          onBackToLogin={() => setActiveMode('login')}
        />
      )}
    </div>
  )
}

/**
 * Dedicated Page Component for /login, /signup, /forgot-password
 */
export default function AuthPage() {
  const { path, state, search } = useLocation()
  const navigate = useNavigate()
  const { user, isInitialized } = UserStore.use()

  // Parse destination from state or search query param
  const urlParams = new URLSearchParams(search || (typeof window !== 'undefined' ? window.location.search : ''))
  const redirectTo = state?.from || urlParams.get('from') || urlParams.get('redirect') || null

  // If already logged in, redirect away
  useEffect(() => {
    if (isInitialized && user?.is_logged_in) {
      if (redirectTo && typeof redirectTo === 'string') {
        navigate({ url: redirectTo })
      } else {
        navigate({ to: home })
      }
    }
  }, [isInitialized, user?.is_logged_in, redirectTo, navigate])

  const initialTab = path.includes('/signup')
    ? 'signup'
    : path.includes('/forgot-password')
    ? 'forgot'
    : 'login'

  const handleSuccess = () => {
    if (redirectTo && typeof redirectTo === 'string') {
      navigate({ url: redirectTo })
    } else {
      navigate({ to: home })
    }
  }

  return (
    <Container className="py-10 md:py-16 max-w-md mx-auto px-4">
      <div className="glass-card p-6 sm:p-8 rounded-3xl shadow-2xl border border-border relative overflow-hidden">
        {/* Subtle accent glow at top */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-24 bg-accent/20 rounded-full blur-2xl pointer-events-none" />

        <Stack spacing={4} className="relative z-10">
          {/* DigiComp Logo */}
          <div className="flex justify-center pb-2">
            <Link to={home} preload="intent" aria-label="DigiComp Technologies">
              <Logo className="h-7 w-auto" />
            </Link>
          </div>

          <AuthTabs defaultTab={initialTab} onSuccess={handleSuccess} />
        </Stack>
      </div>
    </Container>
  )
}
