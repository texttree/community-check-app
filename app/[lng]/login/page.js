import { login, signup } from './actions'
import FormComponent from './client'

export default async function LoginPage({ params: { lng } }) {
  return (
    <>
      <form>
        <label htmlFor="email">Email:</label>
        <input id="email" name="email" type="email" required />
        <label htmlFor="password">Password:</label>
        <input id="password" name="password" type="password" required />
        <button formAction={login}>Log in</button>
        <button formAction={signup}>Sign up</button>
      </form>
      <FormComponent lng={lng} />
    </>
  )
}
