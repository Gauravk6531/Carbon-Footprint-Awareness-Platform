import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [sessionId, setSessionIdState] = useState(() => {
    return localStorage.getItem('sessionId') || null;
  });
  const [userId, setUserId] = useState(localStorage.getItem('userId') || null);
  const [userProfile, setUserProfile] = useState(null);
  const [currentFootprint, setCurrentFootprintState] = useState(() => {
    try {
      const saved = localStorage.getItem('currentFootprint');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Failed to parse currentFootprint from localStorage:', e);
      return null;
    }
  });
  const [calculatorFormData, setCalculatorFormDataState] = useState(() => {
    try {
      const saved = localStorage.getItem('calculatorFormData');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Failed to parse calculatorFormData from localStorage:', e);
      return null;
    }
  });
  const [chatHistory, setChatHistoryState] = useState(() => {
    try {
      const saved = localStorage.getItem('chatHistory');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse chatHistory from localStorage:', e);
      return [];
    }
  });
  const [scenarios, setScenariosState] = useState(() => {
    try {
      const saved = localStorage.getItem('scenarios');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse scenarios from localStorage:', e);
      return [];
    }
  });
  const [selectedScenario, setSelectedScenarioState] = useState(() => {
    try {
      const saved = localStorage.getItem('selectedScenario');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Failed to parse selectedScenario from localStorage:', e);
      return null;
    }
  });

  // Persist sessionId to localStorage
  const setSessionId = (id) => {
    setSessionIdState(id);
    if (id) {
      localStorage.setItem('sessionId', id);
    } else {
      localStorage.removeItem('sessionId');
    }
  };

  // Persist chatHistory to localStorage
  const setChatHistory = (history) => {
    setChatHistoryState(history);
    if (history) {
      localStorage.setItem('chatHistory', JSON.stringify(history));
    } else {
      localStorage.removeItem('chatHistory');
    }
  };

  // Persist scenarios to localStorage
  const setScenarios = (data) => {
    setScenariosState(data);
    if (data) {
      localStorage.setItem('scenarios', JSON.stringify(data));
    } else {
      localStorage.removeItem('scenarios');
    }
  };

  // Persist selectedScenario to localStorage
  const setSelectedScenario = (data) => {
    setSelectedScenarioState(data);
    if (data) {
      localStorage.setItem('selectedScenario', JSON.stringify(data));
    } else {
      localStorage.removeItem('selectedScenario');
    }
  };

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
      scenarios,
      setScenarios,
      selectedScenario,
      setSelectedScenario,
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
