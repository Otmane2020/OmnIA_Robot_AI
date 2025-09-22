/**
 * Utilities for file organization and management
 */

export interface FileStructure {
  pages: string[];
  components: string[];
  hooks: string[];
  utils: string[];
  types: string[];
  styles: string[];
}

export const getProjectStructure = (): FileStructure => {
  return {
    pages: [
      'LandingPage.tsx',
      'AdminLogin.tsx', 
      'AdminDashboard.tsx',
      'SuperAdmin.tsx',
      'RegisterPage.tsx',
      'RobotInterface.tsx',
      'EcommerceDashboard.tsx',
      'MarketingDashboard.tsx',
      'VisionStudio.tsx',
      'SEODashboard.tsx',
      'OmniaBotDashboard.tsx',
      'AnalyticsDashboard.tsx',
      'TermsPage.tsx',
      'PrivacyPage.tsx',
      'ContactPage.tsx',
      'DocumentationPage.tsx'
    ],
    components: [
      'Logo.tsx',
      'Navigation.tsx',
      'Footer.tsx',
      'ChatMessage.tsx',
      'ProductCard.tsx',
      'CartButton.tsx',
      'SuggestionChips.tsx',
      'TypingIndicator.tsx',
      'RobotAvatar.tsx',
      'RobotInitializationScreen.tsx',
      'CameraInterface.tsx',
      'PhotoUploadInterface.tsx',
      'VoiceChatInterface.tsx',
      'CatalogManagement.tsx',
      'ProductDetailModal.tsx',
      'AddProductModal.tsx',
      'ProductsEnrichedTable.tsx',
      'EcommerceIntegration.tsx',
      'ShopifyCSVImporter.tsx',
      'ShopifyAdminConnector.tsx',
      'AITrainingInterface.tsx',
      'ConversationHistory.tsx',
      'MLTrainingDashboard.tsx',
      'MessagingSystem.tsx',
      'SpeechToTextInterface.tsx',
      'NotificationSystem.tsx',
      'OmniaRobotTab.tsx',
      'FeaturedProducts.tsx'
    ],
    hooks: [
      'useWhisperSTT.ts',
      'useAdvancedVoice.ts',
      'useConversationalAI.ts',
      'useGoogleTTS.ts'
    ],
    utils: [
      'fileOrganization.ts'
    ],
    types: [
      'index.ts'
    ],
    styles: [
      'robot-animations.css'
    ]
  };
};

export const validateFileStructure = (structure: FileStructure): boolean => {
  // Validate that all required files exist
  const requiredPages = ['LandingPage.tsx', 'AdminDashboard.tsx', 'RobotInterface.tsx'];
  const requiredComponents = ['Logo.tsx', 'ChatMessage.tsx', 'ProductCard.tsx'];
  
  const hasRequiredPages = requiredPages.every(page => structure.pages.includes(page));
  const hasRequiredComponents = requiredComponents.every(comp => structure.components.includes(comp));
  
  return hasRequiredPages && hasRequiredComponents;
};

export const getFilesByCategory = (category: keyof FileStructure): string[] => {
  const structure = getProjectStructure();
  return structure[category] || [];
};

export const getTotalFileCount = (): number => {
  const structure = getProjectStructure();
  return Object.values(structure).reduce((total, files) => total + files.length, 0);
};