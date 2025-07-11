import React from 'react'
import Hero from '../../components/student/Hero'
import Companies from '../../components/student/Companies'
import CourseSection from '../../components/student/CourseSection'
import TestimonialSection from '../../components/student/TestimonialSection'
import Calltoaction from '../../components/student/Calltoaction'
import Footer from '../../components/student/Footer'
const Home = () => {
  return (
    <div className='flex flex-col items-center space-y-7 text-center'>
      <Hero/>
      <Companies/>
      <CourseSection/>
      <TestimonialSection/>
      <Calltoaction/>
      <Footer/>
    </div>
  )
}

export default Home