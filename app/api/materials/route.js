import { parseChapter, parsingWordText } from '@/helpers/usfmHelper'
import usfm from 'usfm-js'
import { MdToJson } from '@texttree/obs-format-convert-rcl'
const axios = require('axios')

const fs = require('fs')
const path = require('path')
const yauzl = require('yauzl')
const { promisify } = require('util')
const rimraf = promisify(require('rimraf'))

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
    // Проверяем тип ссылки: файл USFM или архив
    if (materialLink.endsWith('.usfm')) {
      return await getDataUsfm(materialLink)
    } else if (materialLink.endsWith('.zip')) {
      return await getDataMd(materialLink)
    } else {
      return new Response(
        JSON.stringify({
          error: 'Incorrect material link: unsupported format',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
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

async function getDataUsfm(materialLink) {
  try {
    const res = await axios.get(materialLink)
    const jsonData = parsingWordText(usfm.toJSON(res.data))

    if (jsonData && jsonData.chapters) {
      const chapters = jsonData.chapters

      for (const key in chapters) {
        chapters[key] = parseChapter(chapters[key])
      }
      const updatedJsonData = {
        ...jsonData,
        chapters: chapters,
      }
      return new Response(JSON.stringify(updatedJsonData), {
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

async function downloadZipFile(materialLink, tempZip) {
  try {
    const response = await axios({
      url: materialLink,
      method: 'GET',
      responseType: 'arraybuffer',
    })
    fs.writeFileSync(tempZip, Buffer.from(response.data))
  } catch (error) {
    console.error('Error downloading ZIP file:', error)
    throw error
  }
}

async function extractZipFile(tempZip) {
  return new Promise((resolve, reject) => {
    yauzl.open(tempZip, { lazyEntries: true }, (err, zipfile) => {
      if (err) {
        reject(err)
        return
      }

      zipfile.on('entry', (entry) => {
        if (/\/$/.test(entry.fileName)) {
          if (!fs.existsSync(entry.fileName)) {
            fs.mkdirSync(entry.fileName)
          }
          zipfile.readEntry()
        } else {
          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) {
              reject(err)
              return
            }
            readStream.pipe(fs.createWriteStream(entry.fileName))
            readStream.on('end', () => {
              zipfile.readEntry()
            })
          })
        }
      })

      zipfile.on('end', () => {
        resolve()
      })

      zipfile.on('error', (err) => {
        reject(err)
      })

      zipfile.readEntry()
    })
  })
}

async function convertMdToJson(directory) {
  try {
    const files = fs.readdirSync(directory)
    const jsonDataArray = []

    for (const file of files) {
      const filePath = path.join(directory, file)
      const stat = fs.statSync(filePath)
      if (stat.isFile()) {
        if (file === 'intro.md' || file === 'title.md') {
          continue
        }

        const fileContent = fs.readFileSync(filePath, 'utf8')
        if (fileContent.trim().length > 0) {
          const jsonData = MdToJson(fileContent)
          jsonDataArray.push(jsonData)
        }
      }
    }
    return jsonDataArray
  } catch (error) {
    console.error('Error converting MD to JSON:', error)
    throw error
  }
}

async function getDataMd(materialLink) {
  const tempZip = 'temp.zip'
  try {
    await downloadZipFile(materialLink, tempZip)
    await extractZipFile(tempZip)

    const directory = 'ru_obs/content'
    const jsonDataArray = await convertMdToJson(directory)

    await removeDirectoryRecursive(`ru_obs`)

    return new Response(JSON.stringify(jsonDataArray), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } finally {
    await removeTempFile(tempZip)
  }
}

async function removeTempFile(tempZip) {
  try {
    fs.unlinkSync(tempZip)
  } catch (error) {
    throw error
  }
}

async function removeDirectoryRecursive(directory) {
  try {
    await rimraf(directory)
  } catch (error) {
    throw error
  }
}
