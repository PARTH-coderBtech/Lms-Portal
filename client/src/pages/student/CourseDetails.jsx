import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import Loading from '../../components/student/Loading'
import { assets } from '../../assets/assets'
import humanizeDuration from 'humanize-duration'
import Footer from '../../components/student/Footer'
import Youtube from 'react-youtube'
import axios from 'axios'
import { toast } from 'react-toastify'
const CourseDetails = () => {
  const { id } = useParams()
  const [openSection, setOpenSection] = useState({})
  const [isAlraedyEnrolled, setIsAlreadyEnrolled] = useState(false)
  const [courseData, setCourseData] = useState(null)
  const [playerData, setPlayerData] = useState(null)
  const { allCourses, calculateRating, calculateCourseDuration, calculateChapterTime, calculateNoOfLectures, currency,backendUrl,userData ,getToken} = useContext(AppContext)
  const fetchCourseData = async () => {
    try {
      const {data} = await axios.get(backendUrl + '/api/course/' + id)
      if(data.success){
        setCourseData(data.courseData)
      }
      else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const enrollCourse = async () =>{
    try {
      if(!userData){
       return toast.warning('Login to Enroll')
      }
      if(isAlraedyEnrolled){
        return toast.warning('Already Enrolled')
      }
      const token = await getToken();
      const {data} = await axios.post(backendUrl + '/api/user/purchase',{courseId:courseData._id},{headers:{Authorization: `Bearer ${token}`}})
      if(data.success){
        const {session_url} = data;
        window.location.replace(session_url)
      }
      else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }
  useEffect(() => {
    fetchCourseData();
  }, [])

  useEffect(() => {
    if(userData && courseData){
      setIsAlreadyEnrolled(userData.enrolledCourses.includes(courseData._id))
    }
  }, [userData,courseData])
  const toggleSection = (index) => {
    setOpenSection((prev) => (
      { ...prev, [index]: !prev[index] }
    ))

  }
  return courseData ? (
    <>
      <div className='flex md:flex-row flex-col gap-10 relative items-start justify-between md:px-36 px-8 md:pt-30 pt-20 text-left'>
        <div className='absolute top-0 left-0 w-full h-section-height z-1 bg-gradient-to-b from-cyan-100/70'></div>



        <div className='max-w-xl z-10 text-gray-500'>
          <h1 className='md:text-course-details-heading-large text-course-details-heading-small font-semibold text-gray-800'>{courseData.courseTitle}</h1>
          <p className='pt-4 md:text-base text-sm' dangerouslySetInnerHTML={{ __html: courseData.courseDescription.slice(0, 200) }}></p>

          <div className='flex items-center space-x-2 pt-3 pb-1 text-sm'>
            <p>{calculateRating(courseData)}</p>
            <div className='flex '>
              {[...Array(5)].map((_, i) => (<img className='w-3.5 h-3.5' key={i} src={i < Math.floor(calculateRating(courseData)) ? assets.star : assets.star_blank} alt="" />))}
            </div>
            <p className='text-blue-600'>({courseData.courseRatings.length}{courseData.courseRatings.length > 1 ? 'rating' : 'rating'}</p>
            <p>{courseData.enrolledStudents.length}{courseData.enrolledStudents.length > 1 ? 'students' : 'student'})</p>
          </div>
          <p className='text-sm'>Course By <span className='text-blue-600 underline'>{courseData.educator.name}</span></p>
          <div className='pt-8 text-gray-800'>
            <h2 className='text-xl font-semibold'>Course Structure</h2>
            <div className='pt-5'>
              {courseData.courseContent.map((chapter, index) => (
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
                          <img src={assets.play_icon} alt="play icon" className="w-4 h-4 mt-1" />
                          <div className="flex flex-col w-full">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                              <p className="text-sm md:text-base font-medium text-gray-800">
                                {lecture.lectureTitle}
                              </p>
                              <div className="flex gap-3 items-center mt-1 md:mt-0 md:ml-4">
                                {lecture.isPreviewFree && (
                                  <p 
                                  onClick={()=>{
                                    setPlayerData({
                                      videoId: lecture.lectureUrl.split('/').pop(),
                                    })
                                  }}
                                  
                                  className="text-blue-500 text-xs md:text-sm underline underline-offset-2 hover:text-blue-600 cursor-pointer whitespace-nowrap">
                                    Preview
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
          </div>
          <div className='py-20 text-sm md:text-default'>
            <h3 className='text-xl font-semibold text-gray-900'>
              Course Discription
              <p className='pt-3 rich-text' dangerouslySetInnerHTML={{ __html: courseData.courseDescription }}></p>
            </h3>
          </div>
        </div>


        <div className='max-w-course-card z-10 shadow-custom-card rounded-t md:rounded-none overflow-hidden bg-white min-w-[300px] sm:min-w-[420px]'>
          {
                playerData ?
                 <Youtube videoId={playerData.videoId} opts={{playerVars:{autoplay:1}}} iframeClassName='w-full aspect-video'/>
                : <img src={courseData.courseThumbnail} alt="" />
              }
          
          <div className='p-5'>
            <div className='flex items-center gap-2'>
               <img src={assets.time_left_clock_icon} alt="clock_icon" className='w-3.5' />
              <p className='text-red-500'><span className='font-medium'>5 Days</span> left at this price</p>
            </div>
            <div className='flex gap-3 items-center pt-2'>
              <p className='text-gray-800 md:text-4xl text-2xl font-semibold'>{currency}{(courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2)}</p>
              <p className='md:text-lg text-gray-500 line-through'>{currency}{courseData.coursePrice}</p>
              <p className='md:text-lg text-gray-500'>{courseData.discount}% off</p>
            </div>
            <div className='flex items-center text-sm md:text-default gap-4 pt-2 md:pt-4 text-gray-500'>
              <div className='flex items-center gap-1'>
                <img src={assets.star} alt="star icon" />
                <p>{calculateRating(courseData)}</p>
              </div>
              <div className='h-4 w-px bg-gray-500/40'></div>
              <div className='flex items-center gap-1'>
                <img src={assets.time_clock_icon} alt="clock icon" />
                <p>{calculateCourseDuration(courseData)}</p>
              </div>
              <div className='h-4 w-px bg-gray-500/40'></div>
               <div className='flex items-center gap-1'>
                <img src={assets.lesson_icon} alt="clock icon" />
                <p>{calculateNoOfLectures(courseData)} Lessons</p>
              </div>
            </div>
  <button onClick={enrollCourse}
  className='md:mt-6 mt-4 w-full py-3 rounded bg-blue-600 text-white font-medium'>
    {isAlraedyEnrolled ? 'Already Enrolled': 'Enroll now'}
    </button>
<div className='pt-6'>
  <p className='md:text-xl text-lg font-medium text-gray-800'>What's in the course?</p>
  <ul className='ml-4 pt-2 text-sm md:text-default list-disc text-gray-500'>
    <li>Lifetime access with free updates.</li>
    <li>Step-by-Step, hands-on project guidance.</li>
    <li>Downloadable resources and source code.</li>
    <li>Quizzes to test your knowledge.</li>
    <li>Certificate of completion</li>
  </ul>
</div>


          </div>
        </div>
      </div>
      <Footer/>
    </>
  ) : <Loading />
}

export default CourseDetails