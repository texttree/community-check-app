const getText = (verseObject) => {
  return verseObject.text || verseObject.nextChar || ''
}

// +
const getFootnote = (verseObject) => {
  return '<sup>' + verseObject.content + '</sup>' //TODO переделать
}

// +
const getMilestone = (verseObject, showUnsupported) => {
  const { tag, children } = verseObject

  switch (tag) {
    case 'k':
      return children.map((child) => getObject(child, showUnsupported)).join(' ')
    case 'zaln':
      if (children.length === 1 && children[0].type === 'milestone') {
        return getObject(children[0], showUnsupported)
      } else {
        return getAlignedWords(children)
      }
    default:
      return ''
  }
}

// +
const getAlignedWords = (verseObjects) => {
  return verseObjects
    .map((verseObject) => {
      return getWord(verseObject)
    })
    .join('')
}

// +
const getSection = (verseObject) => {
  return verseObject.content
}

// +
const getUnsupported = (verseObject) => {
  return '***' + (verseObject.content || verseObject.text) + '***'
}

// +
const getWord = (verseObject) => {
  return verseObject.text || verseObject.content
}
const getVerseText = (verseObjects, showUnsupported = false) => {
  return verseObjects
    .map((verseObject) => getObject(verseObject, showUnsupported))
    .join('')
}

const getObject = (verseObject, showUnsupported) => {
  if (!verseObject) return

  const { type } = verseObject
  switch (type) {
    case 'quote':
    case 'text':
      return getText(verseObject)
    case 'milestone':
      return getMilestone(verseObject, showUnsupported)
    case 'word':
      if (verseObject.strong) {
        return getAlignedWords([verseObject])
      } else {
        return getWord(verseObject)
      }
    case 'section':
      return getSection(verseObject)
    case 'paragraph':
      return '\n'
    case 'footnote':
      return getFootnote(verseObject)
    default:
      if (showUnsupported) {
        return getUnsupported(verseObject)
      } else {
        return ''
      }
  }
}
export const parseChapter = (chapter, verses) => {
  let resultChapter = Object.entries(chapter)
  if (verses && verses.length > 0) {
    resultChapter = resultChapter.filter((el) => verses.includes(el[0]))
  }
  return resultChapter.map((el) => {
    return { verse: el[0], text: getVerseText(el[1].verseObjects, false) }
  })
}

export const parsingWordText = (jsonData) => {
  if (!jsonData || !jsonData.chapters || typeof jsonData.chapters !== 'object') {
    return
  }

  const result = { headers: jsonData.headers, chapters: {} }

  const processVerseObject = (verseObject) => {
    if (!verseObject || typeof verseObject !== 'object') return

    if (verseObject.text) {
      return { type: verseObject.type, text: verseObject.text }
    } else if (
      verseObject.type === 'milestone' &&
      verseObject.children &&
      Array.isArray(verseObject.children)
    ) {
      const childrenTexts = verseObject.children.map((child) => processVerseObject(child))
      return { type: 'milestone', tag: 'zaln', children: childrenTexts.filter(Boolean) }
    }
  }

  const processVerse = (verse) => {
    const verseObjects = (verse.verseObjects || []).map(processVerseObject)
    return { verseObjects: verseObjects.filter(Boolean) }
  }

  const processChapter = (chapter) => {
    const chapterResult = {}

    for (const [verseNumber, verse] of Object.entries(chapter)) {
      chapterResult[verseNumber] = processVerse(verse)
    }

    return chapterResult
  }

  for (const [chapterNumber, chapter] of Object.entries(jsonData.chapters)) {
    if (typeof chapter !== 'object') continue
    result.chapters[chapterNumber] = processChapter(chapter)
  }

  return result
}
