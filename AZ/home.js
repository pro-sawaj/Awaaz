// 1. Memory Cache banayenge (Files ko store karne ke liye)
const componentCache = {};

// 2. Yeh function file ko background mein load karega aur cache mein save karega
async function fetchAndCache(filePath) {
    // Agar file pehle se memory mein hai, toh wahi se return kardo (Instant)
    if (componentCache[filePath]) {
        return componentCache[filePath];
    }
    
    // Agar nahi hai, toh network se fetch karo aur memory mein save kar lo
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`File nahi mili: ${filePath}`);
        
        const htmlText = await response.text();
        componentCache[filePath] = htmlText; // Memory mein save kar liya
        return htmlText;
    } catch (error) {
        console.error("Fetch error:", error);
        return ""; // Error aane par blank return karega
    }
}

// 3. Yeh function Component ko instantly UI mein daal dega
async function loadComponent(elementId, filePath) {
    const container = document.getElementById(elementId);
    if (!container) return; // Agar div nahi hai toh code yahin rok do

    // Data ko cache se la rahe hain (Zero waiting)
    const htmlText = await fetchAndCache(filePath);
    container.innerHTML = htmlText;

    // BROWSER SECURITY BYPASS (Scripts ko execute karne ke liye)
    const scripts = container.querySelectorAll("script");
    scripts.forEach(oldScript => {
        const newScript = document.createElement("script");
        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        oldScript.parentNode.replaceChild(newScript, oldScript);
    });
}

// 4. Jab Webpage load ho, toh turant action shuru karo
window.addEventListener('DOMContentLoaded', () => {
    
    // UI FIX: Theme sabse pehle check karein (Instant Dark Mode)
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
    
    // PERFORMANCE FIX: Background mein data fetch aur load karo (Parallel)
    // Ab agar aap kisi click event par bhi inko load karenge, toh ye instant open honge
    Promise.all([
        loadComponent('header-root', './components/layout/header.html'),
        loadComponent('sidebar-root', './components/layout/sidebar.html')
    ]);

});
