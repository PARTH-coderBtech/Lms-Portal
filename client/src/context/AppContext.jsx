import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeduration from "humanize-duration";
import {useAuth,useUser} from '@clerk/clerk-react' 
export const AppContext = createContext();

export const AppContextProvider = (props) => {


  const currency = import.meta.env.VITE_CURRENCY || '$';
  const navigate = useNavigate();
   const {getToken} = useAuth()
   const {user}  = useUser()
  
  
  const [allCourses, setAllCourses] = useState([])
   const [isEducator, setIsEducator] = useState(true);
   const [enrolledCourses, setEnrolledCourses] = useState([]);
  const fetchAllCourses = async () => {
  setAllCourses(dummyCourses)
  }
  const calculateRating = (course) => {
    if(course.courseRatings.length === 0){
      return 0;
    }
    let totalRating = 0;
    course.courseRatings.forEach(rating =>{
      totalRating += rating.rating;
    })
    return totalRating/course.courseRatings.length;
  }
// course chapter time
const calculateChapterTime = (chapter) =>{
  let time = 0;
  chapter.chapterContent.map((lecture)=> time += lecture.lectureDuration);
  return humanizeduration(time * 60 * 1000,{units:['h','m']})
}

const calculateCourseDuration = (course) =>{
   let time = 0;
   course.courseContent.map((chapter)=> chapter.chapterContent.map(
    (lecture) => time += lecture.lectureDuration
   ));
   return humanizeduration(time * 60 * 1000, {units:['h','m']});
}
  const calculateNoOfLectures = (course) =>{
    let totalLectures = 0;
    course.courseContent.forEach(chapter => {
      if(Array.isArray(chapter.chapterContent)){
        totalLectures += chapter.chapterContent.length;
      }
    });
    return totalLectures
  }
 //user enrolled courses
 const fetchUserEnrollledCourses = async()=>{
  setEnrolledCourses(dummyCourses)
 }



  useEffect(()=>{
    fetchAllCourses()
    fetchUserEnrollledCourses();
  },[])

  const logToken = async () =>{
    console.log(await getToken());
  }
  useEffect(()=>{
    if(user){
      logToken()
    }
  },[user])
  const value = {
    currency, allCourses,navigate,calculateRating,
    isEducator, setIsEducator , calculateCourseDuration, calculateChapterTime,calculateNoOfLectures
     ,fetchUserEnrollledCourses,enrolledCourses,
  }
    return (
    <AppContext.Provider value={value}>
        {props.children}
    </AppContext.Provider>
)
}