<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OmnIA – Showroom Stylist</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js"></script>
    <style>
        :root {
            --primary: #4a6fa5;
            --primary-light: #e1ebf7;
            --secondary: #f8f9fa;
            --text: #333;
            --text-light: #666;
            --border: #ddd;
            --user-bubble: #e1ebf7;
            --assistant-bubble: #f0f0f0;
            --shadow: 0 2px 8px rgba(0,0,0,0.1);
            --radius: 12px;
            --radius-sm: 6px;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        }

        body {
            background-color: #f9f9f9;
            color: var(--text);
            line-height: 1.6;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }

        header {
            background: white;
            padding: 1rem;
            box-shadow: var(--shadow);
            text-align: center;
            z-index: 10;
        }

        .logo {
            font-weight: 700;
            font-size: 1.5rem;
            color: var(--primary);
        }

        .tagline {
            font-size: 0.9rem;
            color: var(--text-light);
        }

        .container {
            display: flex;
            flex: 1;
            overflow: hidden;
        }

        @media (max-width: 768px) {
            .container {
                flex-direction: column;
            }
        }

        .chat-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            background: white;
            border-right: 1px solid var(--border);
        }

        @media (max-width: 768px) {
            .chat-container {
                border-right: none;
                border-bottom: 1px solid var(--border);
            }
        }

        .messages {
            flex: 1;
            overflow-y: auto;
            padding: 1rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .message {
            max-width: 80%;
            padding: 0.75rem 1rem;
            border-radius: var(--radius);
            animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .user-message {
            align-self: flex-end;
            background-color: var(--user-bubble);
            border-bottom-right-radius: 4px;
        }

        .assistant-message {
            align-self: flex-start;
            background-color: var(--assistant-bubble);
            border-bottom-left-radius: 4px;
        }

        .thinking {
            align-self: flex-start;
            background-color: var(--assistant-bubble);
            padding: 0.5rem 1rem;
            border-radius: var(--radius);
            font-style: italic;
            color: var(--text-light);
        }

        .input-area {
            padding: 1rem;
            border-top: 1px solid var(--border);
            display: flex;
            gap: 0.5rem;
            background: white;
        }

        .input-wrapper {
            flex: 1;
            display: flex;
            background: var(--secondary);
            border-radius: 24px;
            padding: 0.25rem 0.75rem;
            align-items: center;
        }

        input {
            flex: 1;
            border: none;
            background: transparent;
            padding: 0.5rem;
            outline: none;
            font-size: 1rem;
        }

        .action-btn {
            background: none;
            border: none;
            color: var(--text-light);
            cursor: pointer;
            font-size: 1.25rem;
            padding: 0.5rem;
            border-radius: 50%;
            transition: all 0.2s;
        }

        .action-btn:hover {
            background: rgba(0,0,0,0.05);
            color: var(--primary);
        }

        .send-btn {
            background: var(--primary);
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
        }

        .send-btn:hover {
            background: #3a5a80;
        }

        .chip-container {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }

        .chip {
            background: var(--primary-light);
            color: var(--primary);
            padding: 0.5rem 1rem;
            border-radius: 16px;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.2s;
        }

        .chip:hover {
            background: var(--primary);
            color: white;
        }

        .suggestions-container {
            flex: 0 0 320px;
            overflow-y: auto;
            padding: 1rem;
            background: var(--secondary);
        }

        @media (max-width: 768px) {
            .suggestions-container {
                flex: 0 0 auto;
                max-height: 40vh;
            }
        }

        .suggestions-title {
            font-size: 1.1rem;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--border);
            color: var(--text-light);
        }

        .products-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1rem;
        }

        @media (min-width: 1200px) {
            .products-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        .product-card {
            background: white;
            border-radius: var(--radius);
            overflow: hidden;
            box-shadow: var(--shadow);
            transition: transform 0.2s;
        }

        .product-card:hover {
            transform: translateY(-4px);
        }

        .product-image {
            height: 160px;
            background-color: #f0f0f0;
            background-size: cover;
            background-position: center;
        }

        .product-details {
            padding: 1rem;
        }

        .product-title {
            font-weight: 600;
            margin-bottom: 0.5rem;
        }

        .product-category {
            color: var(--text-light);
            font-size: 0.8rem;
            margin-bottom: 0.5rem;
        }

        .product-price {
            background: var(--primary-light);
            color: var(--primary);
            padding: 0.25rem 0.5rem;
            border-radius: var(--radius-sm);
            display: inline-block;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }

        .product-specs {
            display: flex;
            justify-content: space-between;
            font-size: 0.8rem;
            color: var(--text-light);
            margin-bottom: 1rem;
        }

        .product-actions {
            display: flex;
            gap: 0.5rem;
        }

        .product-btn {
            flex: 1;
            padding: 0.5rem;
            border: none;
            border-radius: var(--radius-sm);
            cursor: pointer;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.25rem;
            transition: all 0.2s;
        }

        .open-btn {
            background: var(--primary);
            color: white;
        }

        .open-btn:hover {
            background: #3a5a80;
        }

        .qr-btn {
            background: var(--secondary);
            color: var(--text);
        }

        .qr-btn:hover {
            background: #e0e0e0;
        }

        .thumbnail {
            width: 40px;
            height: 40px;
            border-radius: 4px;
            object-fit: cover;
            margin-right: 0.5rem;
            border: 1px solid var(--border);
        }

        #qrModal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 100;
            align-items: center;
            justify-content: center;
        }

        .modal-content {
            background: white;
            padding: 2rem;
            border-radius: var(--radius);
            text-align: center;
            max-width: 300px;
        }

        #qrCode {
            margin: 1rem 0;
        }

        .close-btn {
            background: var(--primary);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: var(--radius-sm);
            cursor: pointer;
        }
        
        /* Nouveaux styles pour l'interface améliorée */
        .typing-indicator {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .typing-dot {
            width: 8px;
            height: 8px;
            background-color: var(--text-light);
            border-radius: 50%;
            animation: typingAnimation 1.4s infinite ease-in-out;
        }
        
        .typing-dot:nth-child(1) { animation-delay: 0s; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes typingAnimation {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-5px); }
        }
        
        .voice-recording {
            animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
    </style>
</head>
<body>
    <header>
        <div class="logo">OmnIA</div>
        <div class="tagline">Your personal showroom stylist</div>
    </header>

    <div class="container">
        <div class="chat-container">
            <div class="messages" id="messages">
                <!-- Messages will be added here dynamically -->
            </div>
            <div class="input-area">
                <div class="input-wrapper">
                    <input type="file" id="imageUpload" accept="image/*" style="display: none;">
                    <button class="action-btn" id="imageBtn" title="Upload image">
                        <i class="fas fa-image"></i>
                    </button>
                    <input type="text" id="userInput" placeholder="Describe your room or needs...">
                    <button class="action-btn" id="voiceBtn" title="Voice input">
                        <i class="fas fa-microphone"></i>
                    </button>
                </div>
                <button class="send-btn" id="sendBtn">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>

        <div class="suggestions-container">
            <div class="suggestions-title">Product Suggestions</div>
            <div class="products-grid" id="productsGrid">
                <!-- Product cards will be added here dynamically -->
            </div>
        </div>
    </div>

    <div id="qrModal">
        <div class="modal-content">
            <h3>Product QR Code</h3>
            <div id="qrCode"></div>
            <button class="close-btn" id="closeModal">Close</button>
        </div>
    </div>

    <script>
        // Configuration
        const BACKEND_URL = "https://omnia-ai.onrender.com"; // Your backend URL
        
        // Sample product catalog (would normally come from /api/catalogue)
        const sampleCatalog = [
            {
                sku: "SOF-DUN-260",
                title: "Canapé Dunbar 3 places 260 cm",
                category: "Sofa",
                width_cm: 260,
                depth_cm: 95,
                height_cm: 80,
                color: "Beige",
                material: "Textured fabric",
                price_ttc: 1299,
                stock: 0,
                lead_days: 45,
                image_url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
                product_url: "https://example.com/products/sofa-dunbar",
                showroom_slot: "C1"
            },
            {
                sku: "SOF-RIO-240",
                title: "Canapé Rio 240 cm",
                category: "Sofa",
                width_cm: 240,
                depth_cm: 95,
                height_cm: 85,
                color: "Navy",
                material: "Linen",
                price_ttc: 1190,
                stock: 3,
                lead_days: 20,
                image_url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
                product_url: "https://example.com/products/sofa-rio",
                showroom_slot: "C2"
            },
            {
                sku: "TBL-TRAV-120",
                title: "Table basse travertin 120",
                category: "Coffee Table",
                width_cm: 120,
                depth_cm: 60,
                height_cm: 40,
                color: "Natural",
                material: "Travertine",
                price_ttc: 449,
                stock: 5,
                lead_days: 14,
                image_url: "https://images.unsplash.com/photo-1530026186672-2cd00ffc50c7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
                product_url: "https://example.com/products/table-travertin",
                showroom_slot: "T3"
            },
            {
                sku: "BED-SER-200",
                title: "Lit Serena 200x200",
                category: "Bed",
                width_cm: 200,
                depth_cm: 200,
                height_cm: 110,
                color: "Light Oak",
                material: "Solid wood",
                price_ttc: 1899,
                stock: 2,
                lead_days: 30,
                image_url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
                product_url: "https://example.com/products/bed-serena",
                showroom_slot: "B5"
            },
            {
                sku: "DIN-ELG-180",
                title: "Table à manger Eglantine 180 cm",
                category: "Dining Table",
                width_cm: 180,
                depth_cm: 90,
                height_cm: 75,
                color: "Dark Walnut",
                material: "Wood with marble inlay",
                price_ttc: 2100,
                stock: 1,
                lead_days: 45,
                image_url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
                product_url: "https://example.com/products/table-eglantine",
                showroom_slot: "D2"
            }
        ];

        // DOM elements
        const messagesContainer = document.getElementById('messages');
        const userInput = document.getElementById('userInput');
        const sendBtn = document.getElementById('sendBtn');
        const imageBtn = document.getElementById('imageBtn');
        const imageUpload = document.getElementById('imageUpload');
        const voiceBtn = document.getElementById('voiceBtn');
        const productsGrid = document.getElementById('productsGrid');
        const qrModal = document.getElementById('qrModal');
        const qrCode = document.getElementById('qrCode');
        const closeModal = document.getElementById('closeModal');

        // Initial state
        let knownNeeds = {
            category: null,
            color: null,
            width: null,
            budget: null,
            material: null
        };
        
        // Voice recognition
        let recognition = null;
        let isListening = false;

        // Initialize the app
        function init() {
            // Load catalog
            loadCatalogue();
            
            // Show welcome message
            showWelcomeMessage();
            
            // Set up event listeners
            sendBtn.addEventListener('click', sendMessage);
            userInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendMessage();
            });
            
            imageBtn.addEventListener('click', () => {
                imageUpload.click();
            });
            
            imageUpload.addEventListener('change', handleImageUpload);
            
            voiceBtn.addEventListener('click', toggleVoiceInput);
            
            closeModal.addEventListener('click', () => {
                qrModal.style.display = 'none';
            });
            
            // Initialize voice recognition if available
            initVoiceRecognition();
        }

        // Initialize voice recognition
        function initVoiceRecognition() {
            if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
                recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
                recognition.continuous = false;
                recognition.interimResults = false;
                recognition.lang = 'en-US';
                
                recognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    userInput.value = transcript;
                    stopVoiceRecognition();
                };
                
                recognition.onerror = (event) => {
                    console.error('Speech recognition error', event.error);
                    stopVoiceRecognition();
                    addMessage('Error with voice input. Please try again.', 'assistant');
                };
                
                recognition.onend = () => {
                    stopVoiceRecognition();
                };
            } else {
                voiceBtn.style.display = 'none';
            }
        }
        
        // Start voice recognition
        function startVoiceRecognition() {
            if (recognition && !isListening) {
                try {
                    recognition.start();
                    isListening = true;
                    voiceBtn.classList.add('voice-recording');
                    userInput.placeholder = "Listening...";
                } catch (error) {
                    console.error('Voice recognition start error:', error);
                }
            }
        }
        
        // Stop voice recognition
        function stopVoiceRecognition() {
            if (isListening) {
                recognition.stop();
                isListening = false;
                voiceBtn.classList.remove('voice-recording');
                userInput.placeholder = "Describe your room or needs...";
            }
        }
        
        // Toggle voice input
        function toggleVoiceInput() {
            if (isListening) {
                stopVoiceRecognition();
            } else {
                startVoiceRecognition();
            }
        }

        // Show welcome message with category chips
        function showWelcomeMessage() {
            const welcomeMsg = "Hello! I'm OmnIA, your personal showroom stylist. I can help you find the perfect furniture for your space. What are you looking for today?";
            addMessage(welcomeMsg, 'assistant');
            
            // Add category chips
            const categories = ['Sofa', 'Coffee table', 'Dining table', 'TV stand', 'Bed'];
            const chipsHtml = categories.map(cat => 
                `<div class="chip" data-category="${cat}">${cat}</div>`
            ).join('');
            
            const chipsContainer = document.createElement('div');
            chipsContainer.className = 'chip-container';
            chipsContainer.innerHTML = chipsHtml;
            
            // Add event listeners to chips
            setTimeout(() => {
                const chipElements = chipsContainer.querySelectorAll('.chip');
                chipElements.forEach(chip => {
                    chip.addEventListener('click', () => {
                        userInput.value = `I'm looking for a ${chip.dataset.category}`;
                        sendMessage();
                    });
                });
                
                messagesContainer.appendChild(chipsContainer);
                scrollToBottom();
            }, 500);
        }

        // Send a message
        async function sendMessage() {
            const message = userInput.value.trim();
            if (!message) return;
            
            // Add user message to chat
            addMessage(message, 'user');
            userInput.value = '';
            
            // Show thinking indicator with animation
            const thinking = document.createElement('div');
            thinking.className = 'thinking';
            thinking.id = 'thinking';
            
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'typing-indicator';
            typingIndicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
            
            thinking.appendChild(document.createTextNode('Thinking '));
            thinking.appendChild(typingIndicator);
            messagesContainer.appendChild(thinking);
            scrollToBottom();
            
            // Extract information from message
            extractInformation(message);
            
            try {
                // Call backend API
                const response = await fetchAIResponse(message, knownNeeds);
                
                // Remove thinking indicator
                document.getElementById('thinking').remove();
                
                // Add assistant response
                addMessage(response, 'assistant');
                
                // Show suggestions
                const suggestions = getSuggestionsFromAI(knownNeeds);
                displaySuggestions(suggestions);
                
                scrollToBottom();
            } catch (error) {
                console.error('Error fetching AI response:', error);
                
                // Remove thinking indicator
                document.getElementById('thinking').remove();
                
                // Fallback to local response
                const response = generateLocalResponse(message, knownNeeds);
                addMessage(response, 'assistant');
                
                // Show suggestions
                const suggestions = getLocalSuggestions(knownNeeds);
                displaySuggestions(suggestions);
                
                scrollToBottom();
            }
        }
        
        // Fetch AI response from backend
        async function fetchAIResponse(message, context) {
            try {
                const response = await fetch(`${BACKEND_URL}/api/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ message, context })
                });
                
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                
                const data = await response.json();
                return data.reply;
            } catch (error) {
                console.error('Error fetching from API:', error);
                throw error;
            }
        }

        // Add a message to the chat
        function addMessage(text, sender) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender}-message`;
            messageDiv.textContent = text;
            messagesContainer.appendChild(messageDiv);
            scrollToBottom();
        }

        // Scroll to bottom of messages
        function scrollToBottom() {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        // Extract information from user message
        function extractInformation(message) {
            // Extract width (in cm)
            const widthMatch = message.match(/(\d+)\s*cm/);
            if (widthMatch) {
                knownNeeds.width = parseInt(widthMatch[1]);
            }
            
            // Extract budget (in €)
            const budgetMatch = message.match(/€?(\d+)/);
            if (budgetMatch) {
                knownNeeds.budget = parseInt(budgetMatch[1]);
            }
            
            // Extract colors
            const colors = ['white', 'black', 'navy', 'green', 'beige', 'gold', 'brass', 'oak', 'walnut', 'emerald'];
            colors.forEach(color => {
                if (message.toLowerCase().includes(color)) {
                    knownNeeds.color = color;
                }
            });
            
            // Extract materials
            const materials = ['marble', 'travertine', 'linen', 'velvet', 'fabric', 'wood', 'leather'];
            materials.forEach(material => {
                if (message.toLowerCase().includes(material)) {
                    knownNeeds.material = material;
                }
            });
            
            // Extract categories
            const categories = ['sofa', 'table', 'bed', 'tv', 'coffee', 'dining'];
            categories.forEach(category => {
                if (message.toLowerCase().includes(category)) {
                    knownNeeds.category = category;
                }
            });
        }

        // Generate AI-based response (simulated)
        function generateAIBasedResponse(message, knownNeeds) {
            // This would normally come from the OpenAI API via /api/chat
            
            // Sample responses based on user input
            if (message.includes('gold') || message.includes('brass')) {
                return "A navy or deep green sofa will elevate the brass table and keep a modern, calm mood. I'd also keep textures soft (linen/velvet) and avoid high-gloss nearby.";
            }
            
            if (message.includes('oak')) {
                return "Light oak flooring pairs beautifully with beige or linen textiles. Would you like me to suggest some sofa options that would complement your oak flooring?";
            }
            
            if (knownNeeds.width && knownNeeds.budget) {
                return `I've found some options around ${knownNeeds.width}cm width and €${knownNeeds.budget} budget. Would you prefer a modern or more traditional style?`;
            }
            
            return "Thank you for those details. I have some suggestions that would work well with your space. Would you like me to show you some options?";
        }

        // Generate local response when API is not available
        function generateLocalResponse(message, knownNeeds) {
            // Creative palette rules as fallback
            if (message.includes('gold') || message.includes('brass')) {
                return "Gold and brass accents pair beautifully with navy or emerald tones. Consider a velvet sofa in one of these colors to create a luxurious yet modern look.";
            }
            
            if (message.includes('marble') || message.includes('travertine')) {
                return "Marble and travertine work wonderfully with bottle green or black accents. These combinations create a sophisticated, timeless look.";
            }
            
            if (message.includes('light oak')) {
                return "Light oak flooring creates a warm foundation. Pair it with beige or linen textiles for a calm, Scandinavian-inspired look.";
            }
            
            if (message.includes('black')) {
                return "Black furniture makes a bold statement. Balance it with light wood tones and beige or greige upholstery to keep the space feeling open.";
            }
            
            if (message.includes('white')) {
                return "White spaces benefit from warm accents. Consider light wood tones or beige textiles to add warmth without compromising the airy feel.";
            }
            
            return "Thank you for sharing your preferences. I have some suggestions based on your needs. Would you like me to show you some options that might work?";
        }

        // Get suggestions from AI (simulated)
        function getSuggestionsFromAI(needs) {
            // Filter catalog based on known needs
            return sampleCatalog.filter(product => {
                let match = true;
                
                if (needs.category && !product.category.toLowerCase().includes(needs.category)) {
                    match = false;
                }
                
                if (needs.width && product.width_cm > needs.width * 1.15) {
                    match = false;
                }
                
                if (needs.budget && product.price_ttc > needs.budget * 1.15) {
                    match = false;
                }
                
                if (needs.color && !product.color.toLowerCase().includes(needs.color)) {
                    match = false;
                }
                
                return match;
            }).slice(0, 3); // Return max 3 suggestions
        }

        // Get local suggestions when API is not available
        function getLocalSuggestions(needs) {
            // Apply creative pairing rules
            let filteredCatalog = sampleCatalog;
            
            if (needs.color === 'gold' || needs.color === 'brass') {
                filteredCatalog = filteredCatalog.filter(product => 
                    product.color.toLowerCase().includes('navy') || 
                    product.color.toLowerCase().includes('green') ||
                    product.material.toLowerCase().includes('velvet')
                );
            }
            
            if (needs.material === 'marble' || needs.material === 'travertine') {
                filteredCatalog = filteredCatalog.filter(product => 
                    product.color.toLowerCase().includes('green') || 
                    product.color.toLowerCase().includes('black')
                );
            }
            
            if (needs.color === 'light oak') {
                filteredCatalog = filteredCatalog.filter(product => 
                    product.color.toLowerCase().includes('beige') || 
                    product.material.toLowerCase().includes('linen')
                );
            }
            
            if (needs.color === 'black') {
                filteredCatalog = filteredCatalog.filter(product => 
                    product.color.toLowerCase().includes('beige') || 
                    product.material.toLowerCase().includes('light wood')
                );
            }
            
            if (needs.color === 'white') {
                filteredCatalog = filteredCatalog.filter(product => 
                    product.color.toLowerCase().includes('beige') || 
                    product.material.toLowerCase().includes('light wood')
                );
            }
            
            // Also apply practical constraints
            if (needs.width) {
                filteredCatalog = filteredCatalog.filter(product => 
                    product.width_cm <= needs.width * 1.15
                );
            }
            
            if (needs.budget) {
                filteredCatalog = filteredCatalog.filter(product => 
                    product.price_ttc <= needs.budget * 1.15
                );
            }
            
            return filteredCatalog.slice(0, 3); // Return max 3 suggestions
        }

        // Display product suggestions
        function displaySuggestions(products) {
            productsGrid.innerHTML = '';
            
            if (products.length === 0) {
                productsGrid.innerHTML = '<p>No products match your criteria. Try adjusting your requirements.</p>';
                return;
            }
            
            products.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card';
                
                card.innerHTML = `
                    <div class="product-image" style="background-image: url('${product.image_url}')"></div>
                    <div class="product-details">
                        <div class="product-title">${product.title}</div>
                        <div class="product-category">${product.category}</div>
                        <div class="product-price">€${product.price_ttc}</div>
                        <div class="product-specs">
                            <span>${product.width_cm} × ${product.depth_cm} × ${product.height_cm} cm</span>
                            <span>${product.lead_days} days</span>
                        </div>
                        <div class="product-actions">
                            <button class="product-btn open-btn" data-url="${product.product_url}">
                                <i class="fas fa-external-link-alt"></i> Open
                            </button>
                            <button class="product-btn qr-btn" data-url="${product.product_url}">
                                <i class="fas fa-qrcode"></i> QR
                            </button>
                        </div>
                    </div>
                `;
                
                productsGrid.appendChild(card);
                
                // Add event listeners to buttons
                const openBtn = card.querySelector('.open-btn');
                const qrBtn = card.querySelector('.qr-btn');
                
                openBtn.addEventListener('click', () => {
                    window.open(openBtn.dataset.url, '_blank');
                });
                
                qrBtn.addEventListener('click', () => {
                    showQRCode(qrBtn.dataset.url);
                });
            });
        }

        // Show QR code for a product URL
        function showQRCode(url) {
            qrCode.innerHTML = '';
            QRCode.toCanvas(qrCode, url, { width: 200 }, (error) => {
                if (error) console.error(error);
            });
            qrModal.style.display = 'flex';
        }

        // Handle image upload
        function handleImageUpload(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            // Show thumbnail
            const reader = new FileReader();
            reader.onload = (event) => {
                const thumbnail = document.createElement('img');
                thumbnail.src = event.target.result;
                thumbnail.className = 'thumbnail';
                
                // Insert before input
                const inputWrapper = document.querySelector('.input-wrapper');
                inputWrapper.insertBefore(thumbnail, userInput);
                
                // Simulate color detection (would use a real API in production)
                setTimeout(() => {
                    addMessage('I see your room has warm tones with beige walls. This works well with light wood furniture and navy accents.', 'assistant');
                    scrollToBottom();
                }, 1000);
            };
            reader.readAsDataURL(file);
        }

        // Load catalog from API or fallback
        function loadCatalogue() {
            // In a real implementation, this would fetch from /api/catalogue
            // For this example, we're using the sample catalog defined above
            displaySuggestions(sampleCatalog.slice(0, 2)); // Show initial suggestions
        }

        // Initialize the app when the DOM is loaded
        document.addEventListener('DOMContentLoaded', init);
    </script>
</body>
</html>