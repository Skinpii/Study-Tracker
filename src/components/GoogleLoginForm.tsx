import React from 'react';
import { motion } from 'framer-motion';
import { useGoogleAuth } from '../contexts/GoogleAuthContext';

export default function GoogleLoginForm() {
  const { login } = useGoogleAuth();
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      backgroundColor: '#282828',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      overflow: 'hidden'
    }}>
      <motion.div 
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          fontSize: '10rem',
          fontWeight: 'bold',
          color: '#ffffff',
          lineHeight: 0.9,
        }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2, ease: "easeOut" }}
      >
        STUDY<br />TRACKER
      </motion.div>

      <motion.div
        style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          margin: '0 0 1rem 0',
          color: '#ffffff'
        }}>
          Welcome Back
        </h1>
        <p style={{
          fontSize: '1.2rem',
          color: '#cccccc',
          margin: 0
        }}>
          Sign in to continue your study journey
        </p>
      </motion.div>

      <motion.button
        onClick={login}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '300px',
          height: '300px',
          backgroundColor: '#4285f4',
          borderRadius: '50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8rem',
          fontWeight: 'bold',
          color: '#ffffff',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          userSelect: 'none',
          border: '1.5px solid #4285f4',
          outline: 'none',
          boxShadow: '0 4px 20px rgba(66, 133, 244, 0.3)'
        }}
        whileHover={{
          backgroundColor: 'transparent',
          scale: 1.05
        }}
        whileTap={{
          scale: 0.95
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <img
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google"
          style={{ 
            width: '48px', 
            height: '48px',
            marginBottom: '12px',
            background: '#fff', 
            borderRadius: '50%',
            padding: '8px'
          }}
        />
        <span style={{ textAlign: 'center', lineHeight: '1.2' }}>
          SIGN IN<br />WITH<br />GOOGLE
        </span>
      </motion.button>

      {/* Background decorative elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '10%',
        width: '100px',
        height: '100px',
        backgroundColor: '#ff8800',
        borderRadius: '50%',
        opacity: 0.1
      }} />
      <div style={{
        position: 'absolute',
        top: '60%',
        left: '10%',
        width: '60px',
        height: '60px',
        backgroundColor: '#4285f4',
        borderRadius: '50%',
        opacity: 0.1
      }} />
    </div>
  );
} 