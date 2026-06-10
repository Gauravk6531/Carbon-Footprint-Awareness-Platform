import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(null);
  const [userId, setUserId] = useState(localStorage.getItem('userId') || null);
  const [userProfile, setUserProfile] = useState(null);
  const [currentFootprint, setCurrentFootprint] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);

  return (
    <AppContext.Provider value={{
      sessionId,
      setSessionId,
      userId,
      setUserId,
      userProfile,
      setUserProfile,
      currentFootprint,
      setCurrentFootprint,
      chatHistory,
      setChatHistory,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
