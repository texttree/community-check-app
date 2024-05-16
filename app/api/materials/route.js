import { parsingWordText } from '@/helpers/usfmHelper'
import usfm from 'usfm-js'
import { MdToJson } from '@texttree/obs-format-convert-rcl'
const axios = require('axios')

const fs = require('fs')

const yauzl = require('yauzl')

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

async function getDataMd(materialLink) {
  const tempZip = 'temp.zip'
  try {
    const response = await axios({
      url: materialLink,
      method: 'GET',
      responseType: 'arraybuffer', // Указываем тип ответа как arraybuffer
    })

    fs.writeFileSync(tempZip, Buffer.from(response.data)) // Сохраняем полученные данные во временный ZIP-файл

    // Разархивируем ZIP-файл
    await new Promise((resolve, reject) => {
      yauzl.open(tempZip, { lazyEntries: true }, (err, zipfile) => {
        if (err) {
          reject(err)
          return
        }

        zipfile.on('entry', (entry) => {
          if (/\/$/.test(entry.fileName)) {
            // Создаем директории, если это директория
            if (!fs.existsSync(entry.fileName)) {
              fs.mkdirSync(entry.fileName)
            }

            zipfile.readEntry()
          } else {
            // Создаем файлы, если это файл
            zipfile.openReadStream(entry, (err, readStream) => {
              if (err) {
                reject(err)
                return
              }

              // Создаем файл и записываем данные
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

        zipfile.readEntry() // Начинаем чтение архива
      })
    })

    console.log('Extraction completed successfully')
  } catch (error) {
    console.error('Error fetching data:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } finally {
    // Удаляем временные файлы
    fs.unlinkSync(tempZip)
  }
}
