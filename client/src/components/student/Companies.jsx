import React from 'react';
import { assets } from '../../assets/assets';

const Companies = () => {
  return (
    <div className='pt-5'>
      <p className='text-base text-gray-500 text-center'>Trusted by learners from</p>

      {/* Add space below logo section using margin or padding */}
      <div className='flex flex-wrap items-center justify-center gap-6 md:gap-16 md:mt-10 mt-5'>
        <img src={assets.microsoft_logo} alt="Microsoft" className='w-20 md:w-28' />
        <img src={assets.walmart_logo} alt="Walmart" className='w-20 md:w-28' />
        <img src={assets.accenture_logo} alt="Accenture" className='w-20 md:w-28' />
        <img src={assets.adobe_logo} alt="Adobe" className='w-20 md:w-28' />
        <img src={assets.paypal_logo} alt="PayPal" className='w-20 md:w-28' />
      </div>
    </div>
  );
};

export default Companies;
