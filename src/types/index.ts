export interface Product {
  id: string;
  handle: string;
  title: string;
  productType: string;
  vendor: string;
  tags: string[];
  price: number;
  compareAtPrice?: number;
  availableForSale: boolean;
  quantityAvailable: number;
  image_url: string;
  product_url: string;
  description: string;
  variants: ProductVariant[];
  specifications?: ProductSpecifications;
}

export interface ProductSpecifications {
  dimensions?: {
    longueur?: number;
    largeur?: number;
    hauteur?: number;
    profondeur?: number;
    diametre?: number;
    unit?: string;
  };
  materials?: string[];
  weight?: {
    value: number;
    unit: string;
  };
  colors?: string[];
  style?: string;
  capacity?: {
    seats?: number;
    drawers?: number;
    shelves?: number;
  };
  density?: {
    value: number;
    unit: string;
  };
  categorySpecs?: {
    // Canapé specifications
    canapeType?: 'fixe' | 'convertible' | 'couchage' | 'angle';
    canapeState?: 'ferme' | 'ouvert'; // For canapé-lit
    couchageSize?: string; // Size when opened
    
    // Lit specifications
    litType?: 'simple' | 'double' | 'queen' | 'king';
    teteDeLit?: boolean;
    cadreDeLit?: boolean;
    
    // Matelas specifications
    matelasType?: 'ressort' | 'mousse' | 'latex' | 'hybride';
    ressort?: boolean;
    mousseType?: string;
    fermete?: 'souple' | 'medium' | 'ferme' | 'tres-ferme';
    
    // Chaise specifications
    chaiseType?: 'chaise' | 'fauteuil' | 'tabouret' | 'bureau';
    accoudoirs?: boolean;
    pivotant?: boolean;
    reglableHauteur?: boolean;
  };
  care?: string[];
  origin?: string;
  warranty?: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  availableForSale: boolean;
  quantityAvailable: number;
  selectedOptions: {
    name: string;
    value: string;
  }[];
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  products?: Product[];
  audioUrl?: string;
  robotAction?: RobotAction;
  photoUrl?: string;
}

export interface RobotAction {
  type: 'move' | 'point' | 'display' | 'speak' | 'gesture';
  target?: string; // Product ID or location
  coordinates?: { x: number; y: number; z?: number };
  duration?: number;
  message?: string;
  visualData?: {
    imageUrl?: string;
    detectedObjects?: string[];
    sceneDescription?: string;
  };
}

export interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  products: Product[];
  robotStatus: RobotStatus;
}

export interface RobotStatus {
  position: { x: number; y: number; rotation: number };
  battery: number;
  isMoving: boolean;
  isSpeaking: boolean;
  currentTask?: string;
  nearbyProducts: string[];
  visualCapabilities: {
    cameraActive: boolean;
    currentView?: string;
    detectedObjects: string[];
    sceneAnalysis?: string;
  };
  voiceCapabilities: {
    isListening: boolean;
    voiceRecognitionActive: boolean;
    currentLanguage: string;
    voicePersonality: 'professional' | 'friendly' | 'expert';
  };
}
  visualCapabilities: {
    cameraActive: boolean;
    analysisInProgress: boolean;
    lastAnalysis: string;
    currentView?: string;
    detectedObjects: string[];
    sceneAnalysis?: string;
  };