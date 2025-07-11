import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import humanizeDuration from 'humanize-duration'
import Youtube from 'react-youtube'
import Footer from '../../components/student/Footer'
import Rating from '../../components/student/Rating'
import { toast } from 'react-toastify'
import Loading from '../../components/student/Loading'
import axios from 'axios'
const Player = () => {
  const { enrolledCourses, calculateChapterTime , backendUrl,getToken,userData,fetchUserEnrolledCourses } = useContext(AppContext)
  const { courseId } = useParams()
  const [courseData, setCourseData] = useState(null)
  const [openSection, setOpenSection] = useState({})
  const [playerData, setPlayerData] = useState(null)
 const [progressData,setProgressData] = useState(null)
 const [initialRating,setInitialRating] = useState(0)
 
  const getCoursesData = () => {
    enrolledCourses.map((course) => {
      if (course._id === courseId) {
        setCourseData(course)
        course.courseRatings.map((item)=>{
          if(item.userId === userData._id){
            setInitialRating(item.Rating)
          }
        })
      }
    })
  }
  const toggleSection = (index) => {
    setOpenSection((prev) => (
      { ...prev, [index]: !prev[index] }
    ))

  }
  useEffect(() => {
    if(enrolledCourses.length > 0){
      getCoursesData()
    }
  }, [enrolledCourses])


  const markLectureAsCompleted = async (lectureId) =>{
   try {
    const token = await getToken();
    const {data} = await axios.post(backendUrl + '/api/user/update-course-progress',{courseId,lectureId},{headers : {Authorization: `Bearer ${token}`}})
    if(data.success){
      toast.success(data.message)
      getCoursesProgress();
    } else{
      toast.error(data.message)
    }
  
  } catch (error) {
    toast.error(error.message)
   }
  }


  const getCoursesProgress = async () =>{
    try {
      const token = await getToken();
      const {data} = await axios.post(backendUrl + '/api/user/get-course-progress',
        {courseId},{headers : {Authorization: `Bearer ${token}`}}
      )
      if(data.success){
        setProgressData(data.progressData)
      }
      else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleRate = async (rating) =>{
    try {
      const token = await getToken();
      const {data} = await axios.post(backendUrl + '/api/user/add-rating',
        {courseId,rating},{headers : {Authorization: `Bearer ${token}`}}
      )
      if(data.success){
        toast.success(data.message)
        fetchUserEnrolledCourses()
      }
      else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(()=>{
getCoursesProgress()
  },[])
  return courseData ?(
   <>
    <div className='p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36'>
      {/* left column */}
      <div className='text-gray-800'>
        <h2 className='text-xl font-semibold'>Course Structure</h2>


        <div className='pt-5'>
          {courseData && courseData.courseContent.map((chapter, index) => (
            <div key={index} className='border border-gray-300 bg-white mb-2 rounded'>
              <div className='flex items-center justify-between px-4 py-3 cursor-pointer select-none' onClick={() => {
                toggleSection(index)
              }}>
                <div className='flex items-center gap-2'>
                  <img src={assets.down_arrow_icon} alt="down arrow icon" className={`transform transition-transform ${openSection[index] ? 'rotate-180' : ''}`} />
                  <p className='font-semibold md:text-base text-sm'>{chapter.chapterTitle}</p>
                </div>
                <p className='text-sm md:text-default'>{chapter.chapterContent.length} lectures - {calculateChapterTime(chapter)}</p>
              </div>
              <div className={`overflow-hidden transition-all duration-300 ${openSection[index] ? 'max-h-96' : 'max-h-0'}`}>
                <ul className='list-disc md:pl-10 pl-4 text-gray-600 border-t border-gray-300'>
                  {chapter.chapterContent.map((lecture, i) => (
                    <li key={i} className="flex items-start gap-2 py-2">
                      <img src={progressData && progressData.lectureCompleted.includes(lecture.lectureId) ? assets.blue_tick_icon : assets.play_icon} alt="play icon" className="w-4 h-4 mt-1" />
                      <div className="flex flex-col w-full">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <p className="text-sm md:text-base font-medium text-gray-800">
                            {lecture.lectureTitle}
                          </p>
                          <div className="flex gap-3 items-center mt-1 md:mt-0 md:ml-4">
                            {lecture.lectureUrl && (
                              <p
                                onClick={() => {
                                  setPlayerData({
                                    ...lecture, chapter: index + 1, lecture: i + 1
                                  })
                                }}

                                className="text-blue-500 text-xs md:text-sm underline underline-offset-2 hover:text-blue-600 cursor-pointer whitespace-nowrap">
                                Watch
                              </p>
                            )}
                            <p className="text-sm md:text-default font-medium whitespace-nowrap pr-3 min-w-fit">
                              {humanizeDuration(lecture.lectureDuration * 60 * 1000, { units: ['h', 'm'] })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>



                  ))}
                </ul>
              </div>
            </div>
          ))}

        </div>
        <div className='flex items-center gap-2 mt-10 py-3'>
          <h1 className='text-xl font-bold'>Rate this Course</h1>
        <Rating initialRating={initialRating} onRate={handleRate}/>
        </div>
      </div>
      {/* RIgth column */}
      <div>
        {playerData ? (
          <div>
            <Youtube videoId={playerData.lectureUrl.split('/').pop()}  iframeClassName='w-full aspect-video' />
           <div className='flex justify-between items-center mt-1'>
            <p>{playerData.chapter}.{playerData.lecture}{playerData.lectureTitle}</p>
            <button onClick={()=> markLectureAsCompleted(playerData.lectureId)} className='text-blue-600'>{progressData && progressData.lectureCompleted.includes(playerData.lectureId) ? 'Completed':'Mark Complete'}</button>
           </div>
          </div>
        )
          : <img src={courseData ? courseData.courseThumbnail : ''} alt="" />
        }
      </div>
    </div>
    <Footer/>
   </>
  ) : <Loading/>
}

export default Player