import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'

export default function login() {
  const user = useUser()
  const supabase = useSupabaseClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState(false)
  const [password, setPassword] = useState('')
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setError(false)
      router.push('/login')
    } catch (error) {
      setError(error.message)
    }
  }
  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      setError(false)
      if (router.query?.redirectedFrom) {
        router.push(router.query.redirectedFrom)
      } else {
        router.push('/projects')
      }
    } catch (error) {
      setError(error.message)
    }
  }
  return (
    <div>
      {user?.email ? (
        <>
          <p>{user.email}</p>
          <Link href={'/projects'}>Go to projects</Link>
          <br />
          <br />
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={({ target: { value } }) => setEmail(value)}
          />
          <br />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={({ target: { value } }) => setPassword(value)}
          />
          <br />
          <p>{error}</p>
          <button onClick={handleLogin}>Login</button>
        </>
      )}
    </div>
  )
}
