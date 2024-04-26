import FormComponent from './client'

export default async function LoginPage({ params: { lng } }) {
  return <FormComponent lng={lng} />
}
