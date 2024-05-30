import { parseChapter, parsingWordText } from '@/helpers/usfmHelper'
import usfm from 'usfm-js'
import { MdToJson } from '@texttree/obs-format-convert-rcl'
import { supabaseService } from '@/app/supabase/service'
const axios = require('axios')

const fs = require('fs')
const path = require('path')
const yauzl = require('yauzl')
const { promisify } = require('util')
const rimraf = promisify(require('rimraf'))

export async function POST(req) {
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
    let content

    if (materialLink.endsWith('.usfm')) {
      content = await getDataUsfm(materialLink)
    } else if (materialLink.endsWith('.zip')) {
      content = await getDataMd(materialLink)
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

    const checkId = url.searchParams.get('checkId')

    const { data, error } = await supabaseService
      .from('checks')
      .update({ content: content })
      .eq('id', checkId)
      .single()

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({
        message: 'Content updated successfully',
        data: data,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
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
      const verseObjects = convertToVerseObjects(updatedJsonData)
      return verseObjects
    } else {
      throw new Error('Incorrect material format')
    }
  } catch (error) {
    console.error(error)
    throw new Error(error.message)
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

    return jsonDataArray
  } catch (error) {
    console.error('Error processing MD file:', error)
    throw new Error(error.message)
  } finally {
    await removeTempFile(tempZip)
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

function convertToVerseObjects(data) {
  const chapters = data.chapters
  const verses = []

  function compareVerses(a, b) {
    const verseA = extractVerseNumber(a)
    const verseB = extractVerseNumber(b)
    return verseA - verseB
  }

  function extractVerseNumber(verse) {
    if (verse === 'front') return 1 // чтобы 'front' всегда был в конце
    const parts = verse.split('-')
    return parseInt(parts[0], 10)
  }

  for (const chapter in chapters) {
    if (chapters.hasOwnProperty(chapter)) {
      const verseObjects = chapters[chapter]
      const chapterTitle = `${chapter}`
      const chapterVerses = []

      for (const verse of verseObjects) {
        chapterVerses.push({
          text: verse.text,
          verse: verse.verse,
        })
      }

      chapterVerses.sort((a, b) => compareVerses(a.verse, b.verse))

      verses.push({
        chapter: chapterTitle,
        verseObjects: chapterVerses,
      })
    }
  }

  return verses
}
