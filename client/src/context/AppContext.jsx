import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeduration from "humanize-duration";
import { useAuth, useUser } from '@clerk/clerk-react';
import axios from 'axios'
import { toast } from 'react-toastify'
export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKENED_URL;
  const currency = import.meta.env.VITE_CURRENCY || '$';
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { user } = useUser();

  const [allCourses, setAllCourses] = useState([]);
  const [isEducator, setIsEducator] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [userData, setUserData] = useState(null);

  const fetchAllCourses = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/course/all');
      data.success ? setAllCourses(data.courses) : toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchUserData = async () => {
    if (user?.publicMetadata?.role === 'educator') {
      setIsEducator(true);
    }
    try {
      const token = await getToken();
      const { data } = await axios.get(
        backendUrl + '/api/user/data',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      data.success ? setUserData(data.user) : toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchUserEnrolledCourses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(
        backendUrl + '/api/user/enrolled-courses',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      data.success ? setEnrolledCourses(data.enrolledCourses.reverse()) : toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const calculateRating = (course) => {
    if (course.courseRatings.length === 0) return 0;
    const totalRating = course.courseRatings.reduce((acc, r) => acc + r.rating, 0);
    return Math.floor(totalRating / course.courseRatings.length);
  };

  const calculateChapterTime = (chapter) => {
    const time = chapter.chapterContent.reduce((acc, lecture) => acc + lecture.lectureDuration, 0);
    return humanizeduration(time * 60 * 1000, { units: ['h', 'm'] });
  };

  const calculateCourseDuration = (course) => {
    let time = 0;
    course.courseContent.forEach((chapter) => {
      chapter.chapterContent.forEach((lecture) => {
        time += lecture.lectureDuration;
      });
    });
    return humanizeduration(time * 60 * 1000, { units: ['h', 'm'] });
  };

  const calculateNoOfLectures = (course) => {
    return course.courseContent.reduce((total, chapter) =>
      total + (Array.isArray(chapter.chapterContent) ? chapter.chapterContent.length : 0), 0);
  };

  useEffect(() => {
    fetchAllCourses();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchUserEnrolledCourses();
    }
  }, [user]);

  const value = {
    currency, allCourses, navigate, calculateRating,
    isEducator, setIsEducator, calculateCourseDuration, calculateChapterTime,
    calculateNoOfLectures, fetchUserEnrolledCourses, enrolledCourses,
    backendUrl, userData, setUserData, getToken, fetchAllCourses
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};
