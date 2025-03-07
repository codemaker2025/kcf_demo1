import React from 'react'
import Home from './components/Home'
import { Toaster } from 'react-hot-toast';
export default function App() {
  return (
    <div>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 1000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#4CAF50',
            },
          },
          error: {
            style: {
              background: '#f44336',
            },
          },
        }}
      />
      <Home/>
    </div>
  )
}
