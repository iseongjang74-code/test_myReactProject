
import React from 'react';

const ShopIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.25a.75.75 0 0 1-.75-.75v-12a.75.75 0 0 1 .75-.75h19.5a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-.75.75h-4.5m-4.5 0h-3.75m3.75 0V11.25m5.25 2.25V11.25m0 0V9.75M18.75 11.25v-1.5m-16.5 0a3 3 0 0 1 3-3h10.5a3 3 0 0 1 3 3m-16.5 0c0 1.657 1.343 3 3 3h10.5c1.657 0 3-1.343 3-3m-12.75 0h9" />
  </svg>
);

export default ShopIcon;
