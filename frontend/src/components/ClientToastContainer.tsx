'use client';

import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';

export function ClientToastContainer() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ToastContainer 
      position="bottom-right" 
      theme="dark"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
  );
}
