
import React from 'react';

const SocialIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.962c.51.056 1.02.086 1.5.086 1.032 0 2.033-.146 3-.418m-9.379-3.323c.345-.184.71-.343 1.086-.483A8.931 8.931 0 0 1 15 4.5c1.43 0 2.793.324 4.024.893m-15.024 4.885A4.5 4.5 0 0 0 7.5 10.5c1.196 0 2.285.42 3.12 1.121m-4.59 2.508A4.492 4.492 0 0 1 7.5 15c2.023 0 3.841.996 5.032 2.572M12 3v18" />
  </svg>
);

export default SocialIcon;
