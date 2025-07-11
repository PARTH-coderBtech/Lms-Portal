import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import Loading from '../../components/student/Loading'
import axios from 'axios'
import { toast } from 'react-toastify'

const MyCourses = () => {
  const { currency,backendUrl,getToken,isEducator } = useContext(AppContext)
  const [courses, setCourses] = useState(null)


  const fetchEducatorCourses = async () =>{
    try {
      const token = await getToken();
      const {data} = await axios.get(backendUrl + '/api/educator/courses',{headers:{Authorization:`Bearer ${token}`}})

      data.success && setCourses(data.courses)
    } catch (error) {
      toast.error(error.message)
    }
  }
  useEffect(() => {
    if(isEducator){
      fetchEducatorCourses();
    }
    
  }, [isEducator])

  return courses ? (
    <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 overflow-x-auto">
        <h2 className="text-xl font-semibold text-gray-800 px-4 py-4 border-b border-gray-200">My Courses</h2>
        <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
          <thead className="bg-gray-100 text-gray-800 font-semibold">
            <tr>
              <th className="px-4 py-3">All Courses</th>
              <th className="px-4 py-3">Earnings</th>
              <th className="px-4 py-3">Students</th>
              <th className="px-4 py-3">Publish On</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {courses.map((course) => (
              <tr key={course._id} className="hover:bg-gray-50 transition duration-200">
                <td className="px-4 py-3 flex items-center gap-3 truncate">
                  <img
                    src={course.courseThumbnail}
                    alt="Course Thumbnail"
                    className="w-12 h-12 rounded-md object-cover border border-gray-300"
                  />
                  <span className="truncate font-medium hidden md:block">{course.courseTitle}</span>
                </td>
                <td className="px-4 py-3">
                  {currency}
                  {Math.floor(
                    course.enrolledStudents.length *
                      (course.coursePrice - (course.discount * course.coursePrice) / 100)
                  )}
                </td>
                <td className="px-4 py-3">{course.enrolledStudents.length}</td>
                <td className="px-4 py-3">
                  {new Date(course.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ) : (
    <Loading />
  );
  
}

export default MyCourses
