// ==========================================
// 1. CSS Design (JS ke andar hi likha hua)
// ==========================================
const systemCSS = `
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Poppins', sans-serif; }
    body { background-color: #f4f6f9; min-height: 100vh; display: flex; flex-direction: column; }
    #main-container { width: 100%; display: flex; flex-direction: column; padding: 10px; }

    .error-box { background: #ffffff; padding: 20px; margin: 10px auto; width: 90%; max-width: 400px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); text-align: center; }
    .loader-hub { position: relative; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; }
    
    .neon-spinner { width: 100%; height: 100%; border-radius: 50%; background: conic-gradient(#FF3B30, #FF9500, #FFFFFF, #4CD964, #007AFF, #FF3B30); -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #fff 0); mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #fff 0); animation: hyperSpin 0.7s linear infinite; }
    @keyframes hyperSpin { to { transform: rotate(360deg); } }
    
    .glow-pulse { position: absolute; width: 60%; height: 60%; background: #FF9500; filter: blur(20px); opacity: 0.5; animation: pulseGlow 2s infinite alternate; }
    @keyframes pulseGlow { from { opacity: 0.2; transform: scale(1); } to { opacity: 0.6; transform: scale(1.5); } }
    
    .error-text h2 { color: #ff3b30; margin: 0; font-size: 1.5rem; font-weight: 800; letter-spacing: 2px; }
    .error-text p { color: #888; margin: 0; font-size: 0.9rem; font-weight: 600; letter-spacing: 4px; text-transform: uppercase; }

    @media (min-width: 768px) {
        .error-box { max-width: 600px; padding: 40px; gap: 25px; }
        .loader-hub { width: 80px; height: 80px; }
        .error-text h2 { font-size: 2.2rem; }
        .error-text p { font-size: 1.2rem; }
    }
`;

// ==========================================
// 2. Main System Logic
// ==========================================
window.onload = async function() {
    
    // Step A: CSS ko page mein inject karna
    const styleSheet = document.createElement("style");
    styleSheet.innerText = systemCSS;
    document.head.appendChild(styleSheet);

    // Step B: JS khud 'main-container' banayega aur body mein jodeaga
    const mainContainer = document.createElement('div');
    mainContainer.id = 'main-container';
    document.body.appendChild(mainContainer);

    // Step C: Aapke folders ki list
    const folderPaths = [
    
        "header" // Fake folder to test the error design
    ];
    
    // Step D: Har folder ko load karna
    for (let folderName of folderPaths) {
        await loadEcosystemPart(folderName);
    }
};

async function loadEcosystemPart(folderName) {
    const container = document.getElementById('main-container');
    
    const partWrapper = document.createElement('div');
    partWrapper.id = folderName;
    partWrapper.className = "ecosystem-module";
    container.appendChild(partWrapper);
    
    let basePath = `store/${folderName}`;
    let htmlPath = `${basePath}/index.html`;
    let cssPath = `${basePath}/style.css`;
    let jsPath = `${basePath}/script.js`;
    
    // Yeh woh HTML hai jo Error aane par dikhega
    const errorHTML = `
        <div class="error-box">
            <div class="loader-hub">
                <div class="glow-pulse"></div>
                <div class="neon-spinner"></div>
            </div>
            <div class="error-text">
                <h2>ERROR</h2>
                <p>LOADING...</p>
            </div>
        </div>
    `;
    
    try {
        const styleLink = document.createElement('link');
        styleLink.rel = 'stylesheet';
        styleLink.href = cssPath;
        document.head.appendChild(styleLink);
        
        const response = await fetch(htmlPath);
        
        if (response.ok) {
            const htmlContent = await response.text();
            partWrapper.innerHTML = htmlContent;
            
            const scriptTag = document.createElement('script');
            scriptTag.src = jsPath;
            scriptTag.type = 'text/javascript';
            scriptTag.defer = true;
            document.body.appendChild(scriptTag);
            
        } else {
            // Agar file nahi mili
            partWrapper.innerHTML = errorHTML;
        }
    } catch (error) {
        // Agar Network issue hai
        partWrapper.innerHTML = errorHTML;
    }
}
