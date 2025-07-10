import React, { useEffect, useRef, useState } from 'react'
import uniqid from 'uniqid'
import Quill from 'quill'
import { assets } from '../../assets/assets'

const AddCourse = () => {
  const quillRef = useRef(null)
  const editorRef = useRef(null)

  const [courseTitle, setCourseTitle] = useState('')
  const [coursePrice, setCoursePrice] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [image, setImage] = useState(null)
  const [chapters, setChapters] = useState([])
  const [showpopup, setShowPopup] = useState(false)
  const [currentChapterId, setCurrentChapterId] = useState(null)
  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: '',
    lectureDuration: '',
    lectureUrl: '',
    isPreviewFree: false
  })

  // CHAPTER HANDLER
  const handleChapter = (action, chapterId) => {
    if (action === 'add') {
      const title = prompt('Enter chapter name')
      if (title) {
        const newChapter = {
          chapterId: uniqid(),
          chapterTitle: title,
          chapterContent: [],
          collapsed: false,
          chapterOrder: chapters.length > 0 ? chapters.slice(-1)[0].chapterOrder + 1 : 1
        }
        setChapters([...chapters, newChapter])
      }
    } else if (action === 'remove') {
      setChapters(chapters.filter(chapter => chapter.chapterId !== chapterId))
    } else if (action === 'toggle') {
      setChapters(
        chapters.map(chapter =>
          chapter.chapterId === chapterId
            ? { ...chapter, collapsed: !chapter.collapsed }
            : chapter
        )
      )
    }
  }

  // LECTURE HANDLER
  const handleLecture = (action, chapterId, lectureIndex) => {
    if (action === 'add') {
      setCurrentChapterId(chapterId)
      setShowPopup(true)
    } else if (action === 'remove') {
      setChapters(
        chapters.map(chapter => {
          if (chapter.chapterId === chapterId) {
            const updatedLectures = [...chapter.chapterContent]
            updatedLectures.splice(lectureIndex, 1)
            return { ...chapter, chapterContent: updatedLectures }
          }
          return chapter
        })
      )
    }
  }

  // INITIALIZE QUILL
  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow'
      })
    }
  }, [])

  return (
    <div className='h-screen overflow-scroll flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0'>
      <form className='flex flex-col gap-4 max-w-md w-full text-gray-500'>
        <div className='flex flex-col gap-1'>
          <p>Course Title</p>
          <input
            onChange={e => setCourseTitle(e.target.value)}
            value={courseTitle}
            type='text'
            placeholder='Type here'
            className='outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500'
            required
          />
        </div>

        <div className='flex flex-col gap-1'>
          <p>Course Description</p>
          <div ref={editorRef}></div>
        </div>

        <div className='flex items-center justify-between flex-wrap'>
          <div className='flex flex-col gap-1'>
            <p>Course Price</p>
            <input
              onChange={e => setCoursePrice(e.target.value)}
              value={coursePrice}
              type='number'
              className='outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500'
              required
              placeholder='0'
            />
          </div>

          <div className='flex md:flex-row flex-col items-center gap-3'>
            <p>Course Thumbnail</p>
            <label htmlFor='thumbnailImage' className='flex items-center gap-3 cursor-pointer'>
              <img src={assets.file_upload_icon} alt='' className='p-2 bg-blue-500 rounded' />
              <input
                type='file'
                id='thumbnailImage'
                onChange={e => setImage(e.target.files[0])}
                accept='image/*'
                hidden
              />
              {image && <img className='max-h-10' src={URL.createObjectURL(image)} alt='preview' />}
            </label>
          </div>
        </div>

        <div>
          <p>Discount %</p>
          <input
            className='outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500'
            required
            onChange={e => setDiscount(e.target.value)}
            value={discount}
            type='number'
          />
        </div>

        {/* CHAPTERS */}
        <div>
          {chapters.map((chapter, chapterIndex) => (
            <div key={chapter.chapterId} className='bg-white border rounded-lg mb-4'>
              <div className='flex justify-between items-center p-4 border-b'>
                <div className='flex items-center'>
                  <img
                    src={assets.dropdown_icon}
                    alt='icon'
                    width={14}
                    onClick={() => handleChapter('toggle', chapter.chapterId)}
                    className={`mr-2 cursor-pointer transition-all ${chapter.collapsed && 'rotate-90'}`}
                  />
                  <span className='font-semibold'>
                    {chapterIndex + 1}. {chapter.chapterTitle}
                  </span>
                </div>
                <span>{chapter.chapterContent.length} Lectures</span>
                <img
                  src={assets.cross_icon}
                  alt='delete'
                  className='cursor-pointer'
                  onClick={() => handleChapter('remove', chapter.chapterId)}
                />
              </div>

              {!chapter.collapsed && (
                <div className='p-4'>
                  {chapter.chapterContent.map((lecture, lectureIndex) => (
                    <div key={lectureIndex} className='flex justify-between items-center mb-2'>
                      <span>
                        {lectureIndex + 1}. {lecture.lectureTitle} - {lecture.lectureDuration} mins -{' '}
                        <a href={lecture.lectureUrl} target='_blank' className='text-blue-500'>
                          Link
                        </a>{' '}
                        - {lecture.isPreviewFree ? 'Free Preview' : 'Paid'}
                      </span>
                      <img
                        onClick={() => handleLecture('remove', chapter.chapterId, lectureIndex)}
                        src={assets.cross_icon}
                        alt='remove'
                        className='cursor-pointer'
                      />
                    </div>
                  ))}
                  <div
                    onClick={() => handleLecture('add', chapter.chapterId)}
                    className='inline-flex bg-gray-100 p-2 rounded cursor-pointer mt-2'
                  >
                    + Add Lecture
                  </div>
                </div>
              )}
            </div>
          ))}
          <div
            onClick={() => handleChapter('add')}
            className='flex justify-center items-center bg-blue-100 p-2 rounded-lg cursor-pointer'
          >
            + Add Chapter
          </div>

          {/* POPUP */}
          {showpopup && (
            <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50'>
              <div className='bg-white text-gray-700 p-4 rounded relative w-full max-w-80'>
                <h2 className='font-bold mb-2'>Add Lecture</h2>

                <div className='mb-2'>
                  <p>Lecture Title</p>
                  <input
                    type='text'
                    className='mt-1 block w-full border rounded py-1 px-2'
                    value={lectureDetails.lectureTitle}
                    onChange={e =>
                      setLectureDetails({ ...lectureDetails, lectureTitle: e.target.value })
                    }
                  />
                </div>

                <div className='mb-2'>
                  <p>Duration (minutes)</p>
                  <input
                    type='number'
                    className='mt-1 block w-full border rounded py-1 px-2'
                    value={lectureDetails.lectureDuration}
                    onChange={e =>
                      setLectureDetails({ ...lectureDetails, lectureDuration: e.target.value })
                    }
                  />
                </div>

                <div className='mb-2'>
                  <p>Lecture URL</p>
                  <input
                    type='text'
                    className='mt-1 block w-full border rounded py-1 px-2'
                    value={lectureDetails.lectureUrl}
                    onChange={e =>
                      setLectureDetails({ ...lectureDetails, lectureUrl: e.target.value })
                    }
                  />
                </div>

                <div className='mb-2'>
                  <label className='inline-flex items-center gap-2'>
                    <input
                      type='checkbox'
                      checked={lectureDetails.isPreviewFree}
                      onChange={e =>
                        setLectureDetails({
                          ...lectureDetails,
                          isPreviewFree: e.target.checked
                        })
                      }
                    />
                    <span>Is Preview Free?</span>
                  </label>
                </div>

                <button
                  className='w-full bg-blue-400 text-white px-4 py-2 rounded'
                  type='button'
                  onClick={() => {
                    const updatedChapters = chapters.map(chapter => {
                      if (chapter.chapterId === currentChapterId) {
                        return {
                          ...chapter,
                          chapterContent: [...chapter.chapterContent, { ...lectureDetails }]
                        }
                      }
                      return chapter
                    })

                    setChapters(updatedChapters)
                    setLectureDetails({
                      lectureTitle: '',
                      lectureDuration: '',
                      lectureUrl: '',
                      isPreviewFree: false
                    })
                    setShowPopup(false)
                  }}
                >
                  Add
                </button>

                <img
                  onClick={() => setShowPopup(false)}
                  src={assets.cross_icon}
                  alt='close'
                  className='absolute top-4 right-4 w-4 cursor-pointer'
                />
              </div>
            </div>
          )}
        </div>

        <button className='bg-black text-white w-max py-2.5 px-8 rounded my-4' type='button'>
          Add Course
        </button>
      </form>
    </div>
  )
}

export default AddCourse
