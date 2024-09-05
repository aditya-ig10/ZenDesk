// components/AdBanner.js
import React, { useEffect, useRef } from 'react';

const AdBanner = ({ dataAdSlot, dataAdFormat, dataFullWidthResponsive }) => {
  const adRef = useRef(null);

  useEffect(() => {
    // Initialize the ad after script is loaded
    const initializeAd = () => {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    };

    // Ensure the script is loaded
    if (document.querySelector('script[src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) {
      initializeAd();
    } else {
      const checkScriptLoaded = setInterval(() => {
        if (document.querySelector('script[src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) {
          clearInterval(checkScriptLoaded);
          initializeAd();
        }
      }, 100);
    }

    // Cleanup the ad element on component unmount
    return () => {
      if (adRef.current) {
        adRef.current.innerHTML = ''; // Clear ad element
      }
    };
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client="ca-pub-3224167902119761"
      data-ad-slot={dataAdSlot}
      data-ad-format={dataAdFormat}
      data-full-width-responsive={dataFullWidthResponsive.toString()}
      ref={adRef}
    ></ins>
  );
};

export default AdBanner;