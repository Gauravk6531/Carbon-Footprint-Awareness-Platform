import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(null);
  const [userId, setUserId] = useState(localStorage.getItem('userId') || null);
  const [userProfile, setUserProfile] = useState(null);
  const [currentFootprint, setCurrentFootprintState] = useState(() => {
    const saved = localStorage.getItem('currentFootprint');
    return saved ? JSON.parse(saved) : null;
  });
  const [calculatorFormData, setCalculatorFormDataState] = useState(() => {
    const saved = localStorage.getItem('calculatorFormData');
    return saved ? JSON.parse(saved) : null;
  });
  const [chatHistory, setChatHistory] = useState([]);

  // Persist currentFootprint to localStorage
  const setCurrentFootprint = (data) => {
    setCurrentFootprintState(data);
    if (data) {
      localStorage.setItem('currentFootprint', JSON.stringify(data));
    } else {
      localStorage.removeItem('currentFootprint');
    }
  };

  // Persist calculatorFormData to localStorage
  const setCalculatorFormData = (data) => {
    setCalculatorFormDataState(data);
    if (data) {
      localStorage.setItem('calculatorFormData', JSON.stringify(data));
    } else {
      localStorage.removeItem('calculatorFormData');
    }
  };

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
      calculatorFormData,
      setCalculatorFormData,
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
