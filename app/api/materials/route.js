import { parseChapter, parsingWordText } from '@/helpers/usfmHelper'
import usfm from 'usfm-js'
import { MdToJson } from '@texttree/obs-format-convert-rcl'
import { supabaseService } from '@/app/supabase/service'
import axios from 'axios'
import JSZip from 'jszip'
import path from 'path'

export async function POST(req) {
  const url = new URL(req.url)
  const materialLink = url.searchParams.get('materialLink')
  const userId = req.headers.get('x-user-id')

  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized: x-user-id header is missing' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }

  if (!materialLink) {
    return new Response(JSON.stringify({ error: 'Material link is missing' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    let content

    if (materialLink.endsWith('.usfm')) {
      content = await getDataUsfm(materialLink)
    } else if (materialLink.endsWith('.zip')) {
      content = await getDataMd(materialLink)
    } else {
      return new Response(
        JSON.stringify({ error: 'Incorrect material link: unsupported format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const checkId = url.searchParams.get('checkId')

    const { data, error } = await supabaseService
      .from('checks')
      .update({ content, material_link: materialLink })
      .eq('id', checkId)
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({ message: 'Content updated successfully', data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
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
      const updatedJsonData = { ...jsonData, chapters }
      return convertToVerseObjects(updatedJsonData)
    } else {
      throw new Error('Incorrect material format')
    }
  } catch (error) {
    console.error(error)
    throw new Error(error.message)
  }
}

async function getDataMd(materialLink) {
  try {
    const response = await axios({
      url: materialLink,
      method: 'GET',
      responseType: 'arraybuffer',
    })

    const zip = await JSZip.loadAsync(response.data)
    const files = []

    zip.forEach((relativePath, file) => {
      if (
        !file.dir &&
        relativePath.includes('ru_obs/content/') &&
        !relativePath.endsWith('/')
      ) {
        files.push(file)
      }
    })

    const jsonDataArray = []

    for (const file of files) {
      const content = await file.async('string')
      if (
        content.trim().length > 0 &&
        !['intro.md', 'title.md'].includes(path.basename(file.name))
      ) {
        const jsonData = MdToJson(content)
        jsonDataArray.push(jsonData)
      }
    }

    return jsonDataArray
  } catch (error) {
    console.error('Error processing MD file:', error)
    throw new Error('Error converting Markdown to JSON: ' + error.message)
  }
}

function convertToVerseObjects(data) {
  const chapters = data.chapters
  const verses = []

  for (const chapter in chapters) {
    if (chapters.hasOwnProperty(chapter)) {
      const verseObjects = chapters[chapter]
      const chapterTitle = `${chapter}`
      const chapterVerses = []

      for (const verse of verseObjects) {
        chapterVerses.push({ text: verse.text, verse: verse.verse })
      }

      chapterVerses.sort((a, b) => compareVerses(a.verse, b.verse))

      verses.push({ chapter: chapterTitle, verseObjects: chapterVerses })
    }
  }

  return verses
}

function compareVerses(a, b) {
  const verseA = extractVerseNumber(a)
  const verseB = extractVerseNumber(b)
  return verseA - verseB
}

function extractVerseNumber(verse) {
  if (verse === 'front') return 1
  const parts = verse.split('-')
  return parseInt(parts[0], 10)
}
