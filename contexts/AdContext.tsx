
import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import { adReducer, initialAdData } from './adReducer';
import { AdCopy, AdData, AdTemplate, BrandTone, ChatMessage, ChatThread, GeneratedAd } from '@/types/ad.types';
import { Product } from '@/contexts/ProductContext';

type AdContextType = {
  adData: AdData;
  updateAdData: (newData: Partial<AdData>) => void;
  resetAdData: () => void;
  addMediaFile: (file: File) => void;
  removeMediaFile: (index: number) => void;
  addTemplate: (template: AdTemplate) => void;
  removeTemplate: (templateId: string) => void;
  createCustomTemplate: (template: Omit<AdTemplate, 'id' | 'isCustom'>) => AdTemplate;
  getTemplateCopy: (templateId: string) => AdCopy;
  updateAdCopy: (copy: AdCopy) => void;
  generateAdCopy: () => void;
  generateAds: () => void;
  addChatMessage: (adId: string, threadId: string, message: Omit<ChatMessage, 'id'>) => void;
  createChatThread: (adId: string, title: string) => ChatThread;
  getChatThread: (threadId: string) => ChatThread | undefined;
  getGeneratedAd: (adId: string) => GeneratedAd | undefined;
};

const AdContext = createContext<AdContextType | undefined>(undefined);

export const AdProvider = ({ children }: { children: ReactNode }) => {
  const [adData, dispatch] = useReducer(adReducer, initialAdData);

  const updateAdData = useCallback((newData: Partial<AdData>) => {
    dispatch({ type: 'UPDATE_AD_DATA', payload: newData });
  }, []);

  const resetAdData = useCallback(() => {
    dispatch({ type: 'RESET_AD_DATA' });
  }, []);

  const addMediaFile = useCallback((file: File) => {
    dispatch({ type: 'ADD_MEDIA_FILE', payload: file });
  }, []);

  const removeMediaFile = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_MEDIA_FILE', payload: index });
  }, []);

  const addTemplate = useCallback((template: AdTemplate) => {
    dispatch({ type: 'ADD_TEMPLATE', payload: template });
  }, []);

  const removeTemplate = useCallback((templateId: string) => {
    dispatch({ type: 'REMOVE_TEMPLATE', payload: templateId });
  }, []);

  const createCustomTemplate = useCallback((templateData: Omit<AdTemplate, 'id' | 'isCustom'>) => {
    const newTemplate: AdTemplate = {
      ...templateData,
      id: `custom-${Date.now()}`,
      isCustom: true
    };
    
    dispatch({ type: 'ADD_CUSTOM_TEMPLATE', payload: newTemplate });
    return newTemplate;
  }, []);

  const getTemplateCopy = useCallback((templateId: string) => {
    const existing = adData.adCopy.find(c => c.templateId === templateId);
    if (existing) return existing;
    
    // Return a default if not found
    return {
      templateId,
      headline: '',
      subtitle: '',
      bodyText: '',
      callToAction: adData.callToAction || 'Buy Now'
    };
  }, [adData.adCopy, adData.callToAction]);

  const updateAdCopy = useCallback((copy: AdCopy) => {
    dispatch({ type: 'UPDATE_AD_COPY', payload: copy });
  }, []);

  const generateAdCopy = useCallback(() => {
    dispatch({ type: 'GENERATE_AD_COPY' });
  }, []);

  const generateAds = useCallback(() => {
    dispatch({ type: 'GENERATE_ADS' });
  }, []);

  const addChatMessage = useCallback((adId: string, threadId: string, message: Omit<ChatMessage, 'id'>) => {
    dispatch({ 
      type: 'ADD_CHAT_MESSAGE', 
      payload: { adId, threadId, message } 
    });
  }, []);

  const createChatThread = useCallback((adId: string, title: string) => {
    dispatch({ type: 'CREATE_CHAT_THREAD', payload: { adId, title } });
    
    // Find the thread we just created
    for (const ad of adData.generatedAds) {
      if (ad.id === adId) {
        const thread = ad.chatThreads[ad.chatThreads.length - 1];
        if (thread) return thread;
      }
    }
    
    // Return a new thread directly in case the state hasn't updated yet
    return {
      id: `thread-${Date.now()}`,
      adId,
      title,
      messages: [{
        id: `msg-${Date.now()}`,
        sender: 'system' as 'system', // Explicitly typed as 'system'
        content: 'How would you like to modify this ad?',
        timestamp: new Date()
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }, [adData.generatedAds]);

  const getChatThread = useCallback((threadId: string) => {
    for (const ad of adData.generatedAds) {
      const thread = ad.chatThreads.find(t => t.id === threadId);
      if (thread) return thread;
    }
    return undefined;
  }, [adData.generatedAds]);

  const getGeneratedAd = useCallback((adId: string) => {
    return adData.generatedAds.find(ad => ad.id === adId);
  }, [adData.generatedAds]);

  return (
    <AdContext.Provider value={{
      adData,
      updateAdData,
      resetAdData,
      addMediaFile,
      removeMediaFile,
      addTemplate,
      removeTemplate,
      createCustomTemplate,
      getTemplateCopy,
      updateAdCopy,
      generateAdCopy,
      generateAds,
      addChatMessage,
      createChatThread,
      getChatThread,
      getGeneratedAd
    }}>
      {children}
    </AdContext.Provider>
  );
};

export const useAdContext = () => {
  const context = useContext(AdContext);
  if (context === undefined) {
    throw new Error('useAdContext must be used within an AdProvider');
  }
  return context;
};

// Export types from the types file for backward compatibility
export type { 
  BrandTone, 
  AdTemplate, 
  AdCopy, 
  ChatMessage, 
  ChatThread, 
  GeneratedAd 
} from '@/types/ad.types';
