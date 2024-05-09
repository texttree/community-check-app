import { parsingWordText } from '@/helpers/usfmHelper'
import usfm from 'usfm-js'

const axios = require('axios')

export async function GET(req) {
  const url = new URL(req.url)
  const materialLink = url.searchParams.get('materialLink')
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return new Response(
      JSON.stringify({
        error: 'Unauthorized: x-user-id header is missing',
      }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }

  if (!materialLink) {
    return new Response(
      JSON.stringify({
        error: 'Material link is missing',
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }

  try {
    const res = await axios.get(materialLink)
    const jsonData = parsingWordText(usfm.toJSON(res.data))
    if (Object.keys(jsonData?.chapters).length > 0) {
      return new Response(JSON.stringify(jsonData), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    } else {
      return new Response(JSON.stringify({ error: 'Incorrect material format' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}
