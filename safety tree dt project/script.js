// Supabase setup
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://sklgbhgblgklyjutvami.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrbGdiaGdibGdrbHlqdXR2YW1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4NjI5NDgsImV4cCI6MjA2MjQzODk0OH0.rhCuiYnd05KpEcZvFC6kEDYD2_tZNpO8Q2MV2ixjMDY';

const supabase = createClient(supabaseUrl, supabaseKey);

// Configuration
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/6z-L5_1xV/model.json";
const METADATA_URL = "https://teachablemachine.withgoogle.com/models/6z-L5_1xV/metadata.json";

// App State
const state = {
    model: null,
    isModelReady: false,
    isProcessing: false
};

// DOM Elements
const elements = {
    form: document.getElementById('reportForm'),
    treeSelect: document.getElementById('treeId'),
    fileInput: document.getElementById('imageUpload'),
    submitBtn: document.querySelector('#reportForm button'),
    loader: document.getElementById('loader'),
    resultCard: document.getElementById('resultCard'),
    result: document.getElementById('result'),
    preview: document.getElementById('preview'),
    uploadPreview: document.getElementById('uploadPreview'),
    riskBadge: document.getElementById('riskBadge'),
    confidenceMeter: document.getElementById('confidenceMeter'),
    confidenceValue: document.getElementById('confidenceValue'),
    progressText: document.getElementById('progressText')
};

// Initialize Model
async function initModel() {
    try {
        updateProgress("Loading AI model...");
        showLoader();
        
        // Check if dependencies are loaded
        if (typeof tmImage === 'undefined') {
            throw new Error("AI engine not available");
        }

        // Load model with progress updates
        updateProgress("Downloading model data...");
        state.model = await tmImage.load(MODEL_URL, METADATA_URL);
        
        updateProgress("Initializing...");
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate loading
        
        state.isModelReady = true;
        updateProgress("Ready for analysis");
        
        // Enable form
        elements.submitBtn.disabled = false;
        elements.submitBtn.classList.remove('loading');
        hideLoader();
        
        // Show success animation
        animateSuccess();
        
    } catch (error) {
        console.error('[Model] Error:', error);
        updateProgress(`Error: ${error.message}`);
        showError("Failed to load AI model. Please refresh the page.");
        elements.submitBtn.disabled = true;
        elements.submitBtn.textContent = "Model Error - Refresh";
        hideLoader();
    }
}

// Process Image
async function processImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();
        
        reader.onload = (e) => {
            img.src = e.target.result;
            img.onload = () => {
                // Update preview
                elements.uploadPreview.innerHTML = `
                    <div class="image-thumbnail" style="background-image: url('${e.target.result}')"></div>
                    <span>${file.name}</span>
                `;
                resolve(img);
            };
            img.onerror = () => reject(new Error('Failed to load image'));
        };
        
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

// Make Prediction
async function predict(image) {
    if (!state.isModelReady) throw new Error('Model not loaded');
    
    try {
        updateProgress("Analyzing tree health...");
        
        // Show analyzing animation
        elements.confidenceMeter.style.width = '0%';
        elements.confidenceValue.textContent = '0%';
        
        // Simulate progress (real prediction will overwrite this)
        animateConfidenceMeter(0, 30, 500);
        
        const startTime = performance.now();
        const predictions = await state.model.predict(image);
        const duration = (performance.now() - startTime).toFixed(2);
        
        console.log(`[Prediction] Completed in ${duration}ms`);
        
        // Sort predictions by probability
        predictions.sort((a, b) => b.probability - a.probability);
        const topPrediction = predictions[0];
        
        // Update confidence meter with animation
        const confidence = Math.round(topPrediction.probability * 100);
        animateConfidenceMeter(30, confidence, 1000);
        
        return topPrediction;
        
    } catch (error) {
        console.error('[Prediction] Error:', error);
        throw new Error('Analysis failed. Please try another image.');
    }
}

// Show Results
function showResults(treeId, prediction) {
    const isSafe = prediction.className.toLowerCase().includes("safe");
    const confidence = Math.round(prediction.probability * 100);
    const treeInfo = elements.treeSelect.options[elements.treeSelect.selectedIndex].text;
    
    // Set risk badge
    elements.riskBadge.className = 'risk-badge ' + (isSafe ? 'safe' : 'risky');
    elements.riskBadge.textContent = isSafe ? 'SAFE' : 'RISK';
    
    // Animate result card entrance
    elements.resultCard.style.display = 'block';
    elements.resultCard.style.animation = 'fadeIn 0.6s ease-out';
    
    // Build result HTML
    elements.result.innerHTML = `
        <div class="result-content ${isSafe ? 'safe' : 'risky'}">
            <h3>${treeInfo}</h3>
            
            <div class="result-message">
                <i class="fas ${isSafe ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
                <p>${isSafe ? 
                    'This tree shows no signs of immediate danger.' : 
                    'Potential risk detected requiring inspection.'}
                </p>
            </div>
            <div class="result-details">
                <p><strong>Condition:</strong> ${prediction.className}</p>
                <p><strong>Last Inspection:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
        </div>
    `;
    
    // Scroll to results
    setTimeout(() => {
        elements.resultCard.scrollIntoView({ behavior: 'smooth' });
    }, 300);
}

// Show Error
function showError(message) {
    elements.result.innerHTML = `
        <div class="error">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
        </div>
    `;
    elements.resultCard.style.display = 'block';
}

// Animation Helpers
function animateConfidenceMeter(start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        
        elements.confidenceMeter.style.width = `${value}%`;
        elements.confidenceValue.textContent = `${value}%`;
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function animateSuccess() {
    const logo = document.querySelector('.logo');
    logo.classList.add('animate-success');
    setTimeout(() => logo.classList.remove('animate-success'), 1000);
}

// Loader Controls
function showLoader() {
    elements.loader.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function hideLoader() {
    elements.loader.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function updateProgress(message) {
    if (elements.progressText) {
        elements.progressText.textContent = message;
    }
}

// Form Submission
async function handleSubmit(e) {
    e.preventDefault();
    
    // Validate
    const treeId = elements.treeSelect.value;
    const imageFile = elements.fileInput.files[0];
    
    if (!treeId || !imageFile) {
        showError("Please select a tree and upload an image");
        return;
    }
    
    // Set loading state
    state.isProcessing = true;
    elements.submitBtn.classList.add('loading');
    showLoader();
    updateProgress("Processing your request...");
    
    try {
        // Process image
        const img = await processImage(imageFile);
        
        // Create preview
        elements.preview.innerHTML = '';
        const imgElement = document.createElement('img');
        imgElement.src = img.src;
        elements.preview.appendChild(imgElement);
        
        // Predict
        const prediction = await predict(img);
        showResults(treeId, prediction);
        
        await supabase.from('tree_reports').insert({
            treeId: treeId,
            status: prediction.className,
            isRisky: prediction.className.toLowerCase().includes("risk"),
            riskLevel: prediction.probability,
            timestamp: new Date().toISOString(),
            imageUrl: img.src || null,
            reportedBy: "Anonymous"
          });
    } catch (error) {
        console.error('[Submit] Error:', error);
        showError(error.message);
    } finally {
        state.isProcessing = false;
        elements.submitBtn.classList.remove('loading');
        hideLoader();
    }
}

// Event Listeners
function setupEventListeners() {
    // File input change
    elements.fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            elements.uploadPreview.innerHTML = `
                <div class="file-info">
                    <i class="fas fa-file-image"></i>
                    <span>${file.name}</span>
                </div>
                <small>${(file.size / 1024).toFixed(1)} KB</small>
            `;
        }
    });
    
    // Form submission
    elements.form.addEventListener('submit', handleSubmit);
    
    // Tree select hover effect
    elements.treeSelect.addEventListener('mouseenter', () => {
        document.querySelector('.select-arrow').style.transform = 'translateY(-50%) rotate(180deg)';
    });
    
    elements.treeSelect.addEventListener('mouseleave', () => {
        document.querySelector('.select-arrow').style.transform = 'translateY(-50%)';
    });
}

// Initialize App
async function init() {
    setupEventListeners();
    await initModel();
}

// Start App
document.addEventListener('DOMContentLoaded', init);