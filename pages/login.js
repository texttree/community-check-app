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
          <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
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
          </div>

          <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
            <div class="sm:mx-auto sm:w-full sm:max-w-sm">
              <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                Sign in to your account
              </h2>
            </div>

            <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
              <form class="space-y-6" action="#" method="POST">
                <div>
                  <label
                    for="email"
                    class="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Email address
                  </label>
                  <div class="mt-2">
                    <input
                      type="email"
                      placeholder="email"
                      value={email}
                      onChange={({ target: { value } }) => setEmail(value)}
                      class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div>
                  <div class="flex items-center justify-between">
                    <label
                      for="password"
                      class="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Password
                    </label>
                  </div>
                  <div class="mt-2">
                    <input
                      type="password"
                      placeholder="password"
                      value={password}
                      onChange={({ target: { value } }) => setPassword(value)}
                      class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
                <p>{error}</p>
                <div>
                  <button
                    onClick={handleLogin}
                    class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Sign in
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
