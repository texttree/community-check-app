import serverApi from '@/helpers/serverApi'

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

    res.status(200).json(tokens)
  } catch (error) {
    console.error('Error fetching tokens:', error.message)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
