// Yeh function kisi bhi file ko fetch karke diye gaye ID wale div mein daalta hai
async function loadComponent(elementId, filePath) {
    try {
        // File ko network se la rahe hain
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`File nahi mili: ${filePath}`);
        
        // File ka HTML text nikal rahe hain
        const htmlText = await response.text();
        
        // HTML ko container mein set kar rahe hain
        const container = document.getElementById(elementId);
        container.innerHTML = htmlText;

        // BROWSER SECURITY BYPASS: innerHTML se <script> tag run nahi hote. 
        // Isliye hum naya script tag banakar usme purane script ka code daal rahe hain.
        const scripts = container.querySelectorAll("script");
        scripts.forEach(oldScript => {
            const newScript = document.createElement("script");
            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
            newScript.appendChild(document.createTextNode(oldScript.innerHTML));
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });

    } catch (error) {
        console.error("Component load hone mein error:", error);
    }
}

// Jab webpage poori tarah load ho jaye, tab yeh sab components fetch karega
window.addEventListener('DOMContentLoaded', async () => {
    
    // Header, Sidebar aur Main Dashboard ko load karwa rahe hain
    await loadComponent('header-root', './components/layout/header.html');
    await loadComponent('sidebar-root', './components/layout/sidebar.html');
  //  await loadComponent('main-root', './components/dashboard/main-feed.html');

    // Page reload hone par check karo ki user ne last time dark mode select kiya tha ya nahi
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
});
