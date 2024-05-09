import { parsingWordText } from '@/helpers/usfmHelper'
import usfm from 'usfm-js'
import { MdToJson } from '@texttree/obs-format-convert-rcl'

const axios = require('axios')
const fs = require('fs')
const unzipper = require('unzipper')

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
    getDataMd()
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

async function getDataMd() {
  const url = 'https://git.door43.org/ru_gl/ru_obs/archive/master.zip'
  const tempZip = 'ru_obs-master.zip'
  const tempDir = 'ru_obs-master'

  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    })

    const writer = fs.createWriteStream(tempZip)
    response.data.pipe(writer)

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve)
      writer.on('error', reject)
    })

    await new Promise((resolve, reject) => {
      fs.createReadStream(tempZip)
        .pipe(unzipper.Extract({ path: tempDir }))
        .on('close', resolve)
        .on('error', reject)
    })

    const promises = []
    for (let i = 1; i <= 50; i++) {
      const fileName = `${tempDir}/ru_obs/content/${i.toString().padStart(2, '0')}.md`
      promises.push(
        new Promise((resolve, reject) => {
          fs.readFile(fileName, 'utf8', (err, data) => {
            if (err) reject(err)
            const { verseObjects } = MdToJson(data)
            console.log(convertDataToChapters(verseObjects), i)
            resolve()
          })
        })
      )
    }
    await Promise.all(promises)

    const files = fs.readdirSync(tempDir)
    for (const file of files) {
      fs.unlinkSync(`${tempDir}/${file}`)
    }
    fs.rmdirSync(tempDir)
    fs.unlinkSync(tempZip)
  } catch (error) {
    console.error('Ошибка при получении данных:', error)
  }
}

function convertDataToChapters(data) {
  const chapters = {}

  data.forEach((item, index) => {
    const chapterNumber = Math.floor(index / 16) + 1
    const verseNumber = (index % 16) + 1

    if (!chapters[chapterNumber]) {
      chapters[chapterNumber] = {}
    }

    chapters[chapterNumber][verseNumber] = {
      text: item.text,
      verse: item.verse,
    }
  })

  return chapters
}
