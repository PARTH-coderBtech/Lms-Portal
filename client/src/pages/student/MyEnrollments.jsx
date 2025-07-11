import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import {Line} from 'rc-progress'
import Footer from '../../components/student/Footer'
import axios from 'axios'
import { toast } from 'react-toastify'
const MyEnrollments = () => {
  const { enrolledCourses, calculateCourseDuration, navigate,userData,backendUrl,fetchUserEnrolledCourses,getToken,calculateNoOfLectures} = useContext(AppContext)
  const [progressArray, setProgressArray] = useState([])
 const getCourseProgress = async ()=>{
  try {
    const token = await getToken();
    const tempProgressArray  = await Promise.all(
      enrolledCourses.map(async (course) =>{
        const {data} = await axios.post(`${backendUrl}/api/user/get-course-progress`,{courseId: course._id},{headers:{Authorization: `Bearer ${token}`}})
        let totalLecture = calculateNoOfLectures(course);
        const lectureCompleted = data.progressData ? data.progressData.lectureCompleted.length : 0;
           return {totalLecture,lectureCompleted};
      })
    )
    setProgressArray(tempProgressArray);
  } catch (error) {
    toast.error(error.message)
  }
 }
useEffect(()=>{
if(userData){
  fetchUserEnrolledCourses()
}
},[userData])

useEffect(()=>{
  if(enrolledCourses.length > 0){
    getCourseProgress()
  }
},[enrolledCourses])

  return (
    <>
    <div className='md:px-36 px-8 pt-6 pb-4'>
      <h1 className='text-2xl font-semibold'>My Enrollments</h1>

      <table className='table-auto w-full border mt-10 overflow-hidden'>
        <thead className='text-gray-900 border-b border-gray-500/20 text-sm text-left max-sm:hidden'>
          <tr>
            <th className='px-4 py-3 font-semibold truncate'>Course</th>
            <th className='px-4 py-3 font-semibold truncate'>Duration</th>
            <th className='px-4 py-3 font-semibold truncate'>Completed</th>
            <th className='px-4 py-3 font-semibold truncate'>Status</th>
          </tr>
        </thead>

        <tbody className='text-gray-700'>
          {enrolledCourses.map((course, index) => (
            <tr key={index} className='border-b border-gray-500/20'>
              <td className='md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3'>
                <img src={course.courseThumbnail} alt="" className='w-14 sm:w-24 md:w-28 rounded' />
                <div className='flex-1'>
                  <p className='mb-1 max-sm:text-sm'>{course.courseTitle}</p>
                  <Line strokeWidth={2} percent={progressArray[index] ? (progressArray[index].lectureCompleted * 100) / progressArray[index].totalLecture : 0} className='bg-gray-300 rounded-full'></Line>
                </div>
              </td>
                                                                                                    
              <td className='px-4 py-3 max-sm:hidden'>
                {calculateCourseDuration(course)}
              </td>

              <td className='px-4 py-3 max-sm:hidden'>
                {progressArray[index] && `${progressArray[index].lectureCompleted} / ${progressArray[index].totalLecture}`} <span className='text-xs text-gray-500'>Lectures</span>
              </td>

              <td className='px-4 py-3 max-sm:text-right'>
                <button className='bg-blue-600 text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded text-sm' onClick={()=>{
                  navigate('/player/'+ course._id)
                }}>
                  {progressArray[index] && progressArray[index].lectureCompleted/progressArray[index].totalLecture === 1 ? 'Completed' : 'On Going'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <Footer />
    </>
  )
}

export default MyEnrollments
