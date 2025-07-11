import { useContext, useEffect, useState } from 'react'
import React from 'react'
import { dummyStudentEnrolled } from '../../assets/assets'
import Loading from '../../components/student/Loading'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
const StudentsEnrolled = () => {

  const {backendUrl,getToken,isEducator} = useContext(AppContext)
  const [enrolledStudents, setEnrolledStudents] = useState(null)
  const fetchEnrolledStudents = async () => {
    try {
      const token = await getToken();
      const {data} = await axios.get(backendUrl + '/api/educator/enrolled-students',
        {headers:{Authorization:`Bearer ${token}`}}
        
      )
      if(data.success){
          setEnrolledStudents(data.enrolledStudents.reverse())
      }
      else{
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message)
    }
  }
  useEffect(() => {
    if(isEducator){
      fetchEnrolledStudents()
    }
  }, [isEducator])

  return enrolledStudents ? (
    <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
          <thead className="bg-gray-100 text-gray-800 font-semibold">
            <tr>
              <th className="px-4 py-3 text-center hidden sm:table-cell">#</th>
              <th className="px-4 py-3">Student Name</th>
              <th className="px-4 py-3">Course Title</th>
              <th className="px-4 py-3 hidden sm:table-cell">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {enrolledStudents.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition duration-200">
                <td className="px-4 py-3 text-center hidden sm:table-cell">{index + 1}</td>
                <td className="px-4 py-3 flex items-center gap-3 truncate">
                  <img
                    src={item.student.imageUrl}
                    alt="Student"
                    className="w-10 h-10 rounded-full object-cover border border-gray-300"
                  />
                  <span className="truncate font-medium">{item.student.name}</span>
                </td>
                <td className="px-4 py-3 truncate">{item.courseTitle}</td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  {new Date(item.purchaseDate).toLocaleDateString()}
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

export default StudentsEnrolled