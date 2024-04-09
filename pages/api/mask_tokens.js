import serverApi from '@/helpers/serverApi'

const maskTokens = (tokens) => {
  return tokens.map((token_item) => {
    const token = token_item.token
    const visibleChars = 4
    const hiddenChars = token.length - visibleChars * 2
    const hiddenPart = hiddenChars > 0 ? '.'.repeat(hiddenChars) : ''
    const maskedId =
      token.substring(0, visibleChars) +
      hiddenPart +
      token.substring(token.length - visibleChars)

    return { ...token_item, token: maskedId }
  })
}

const fetchTokens = async (supabase) => {
  try {
    const { data, error } = await supabase.rpc('get_tokens')
    if (error) {
      throw new Error(`Failed to fetch tokens: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Error fetching tokens:', error.message)
    throw error
  }
}

export default async function handler(req, res) {
  try {
    let supabase
    try {
      supabase = await serverApi(req, res)
    } catch (error) {
      return res.status(401).json({ error })
    }

    const tokens = await fetchTokens(supabase)
    const maskedTokens = maskTokens(tokens)

    res.status(200).json(maskedTokens)
  } catch (error) {
    console.error('Error fetching tokens1:', error.message)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
