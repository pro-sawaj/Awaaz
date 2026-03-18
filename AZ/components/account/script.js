import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyClj4YnXzEg_xVm-e9ZmLm6OdEDBzt5_cw",
    authDomain: "pro-awaaz.firebaseapp.com",
    projectId: "pro-awaaz",
    storageBucket: "pro-awaaz.firebasestorage.app",
    messagingSenderId: "52821224309",
    appId: "1:52821224309:web:32e48789d593202ad2813c"
};
const IMGBB_KEY = "6ba518a940916ac94149764f5a7b3cc0"; 

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const show = (id) => document.getElementById(id).classList.remove('hidden');
const hide = (id) => document.getElementById(id).classList.add('hidden');
const setLoader = (text, status) => { document.getElementById('loader-text').innerText = text; document.getElementById('loader').style.display = status ? 'flex' : 'none'; };

window.showToast = (message, type = "success") => {
    const toast = document.getElementById("toast");
    const icon = type === "success" ? '<i class="fa-solid fa-circle-check"></i>' : '<i class="fa-solid fa-circle-exclamation"></i>';
    toast.innerHTML = `${icon} <span>${message}</span>`;
    toast.className = `show ${type}`;
    setTimeout(() => { toast.className = toast.className.replace(`show ${type}`, ""); }, 3000);
};

window.switchTab = (tabId, btnElement) => {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    btnElement.classList.add('active');
};

// TEXT EDIT MODAL LOGIC
let currentModalResolve = null;
window.openCustomPrompt = (title, currentValue) => {
    return new Promise((resolve) => {
        const modal = document.getElementById('customModal');
        const input = document.getElementById('modalInput');
        document.getElementById('modalTitle').innerText = `Enter ${title}`;
        input.value = (currentValue === "Add +" || currentValue.includes("Yrs")) ? "" : currentValue;
        modal.classList.add('show');
        setTimeout(() => input.focus(), 300);
        currentModalResolve = resolve;
    });
};
window.closeModal = () => { document.getElementById('customModal').classList.remove('show'); if(currentModalResolve) currentModalResolve(null); };
document.getElementById('btnSaveModal').onclick = () => { const val = document.getElementById('modalInput').value; document.getElementById('customModal').classList.remove('show'); if(currentModalResolve) currentModalResolve(val); };

// ================= PHOTO ACTION MENU LOGIC =================
let currentPhotoEditType = ''; // 'cover' or 'profile'

window.openPhotoMenu = (type) => {
    currentPhotoEditType = type;
    document.getElementById('photoActionTitle').innerText = type === 'cover' ? 'Edit Cover Photo' : 'Edit Profile Photo';
    
    // Check if they currently have a photo to decide if we show the "Delete" option
    let localData = JSON.parse(localStorage.getItem("awaaz_user_data") || "{}");
    const hasPhoto = type === 'cover' ? (localData.coverPic && localData.coverPic !== "") : (localData.profilePic && localData.profilePic !== "");
    
    document.getElementById('btnActionDeletePhoto').style.display = hasPhoto ? "flex" : "none";
    document.getElementById('photoActionModal').classList.add('show');
};

window.closePhotoMenu = () => { document.getElementById('photoActionModal').classList.remove('show'); };

window.triggerPhotoUpload = () => { document.getElementById('sharedPhotoUpload').click(); closePhotoMenu(); };
window.triggerPhotoDelete = () => { window.removePhoto(currentPhotoEditType); closePhotoMenu(); };

// SHARED UPLOAD FUNCTION
document.getElementById('sharedPhotoUpload').onchange = async (e) => {
    const file = e.target.files[0];
    if(!file || !auth.currentUser) return;
    
    const typeText = currentPhotoEditType === 'cover' ? "Cover" : "Profile";
    setLoader(`Updating ${typeText} Photo...`, true);
    
    try {
        const formData = new FormData(); formData.append("image", file);
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: "POST", body: formData });
        const data = await res.json();
        if(data.success) {
            const url = data.data.url;
            const dbField = currentPhotoEditType === 'cover' ? 'coverPic' : 'profilePic';
            
            await updateDoc(doc(db, "nodes", auth.currentUser.uid), { [dbField]: url });
            let localData = JSON.parse(localStorage.getItem("awaaz_user_data") || "{}");
            localData[dbField] = url;
            localStorage.setItem("awaaz_user_data", JSON.stringify(localData));
            
            updateProfileUI(localData, auth.currentUser.email);
            showToast(`${typeText} Photo Updated!`, "success");
        }
    } catch(err) { showToast("Upload Failed", "error"); }
    setLoader("", false);
    e.target.value = ""; // Reset input so same file can be selected again
};

// REMOVE PHOTO FUNCTION
window.removePhoto = async (type) => {
    if(!auth.currentUser) return;
    const typeText = type === 'cover' ? "Cover" : "Profile";
    setLoader(`Removing ${typeText} photo...`, true);
    try {
        const dbField = type === 'profile' ? 'profilePic' : 'coverPic';
        await updateDoc(doc(db, "nodes", auth.currentUser.uid), { [dbField]: "" });
        
        let localData = JSON.parse(localStorage.getItem("awaaz_user_data") || "{}");
        localData[dbField] = "";
        localStorage.setItem("awaaz_user_data", JSON.stringify(localData));
        
        updateProfileUI(localData, auth.currentUser.email);
        showToast(`${typeText} Photo Removed!`, "success");
    } catch (err) { showToast("Failed to remove photo", "error"); }
    setLoader("", false);
};

// ==========================================================

document.getElementById('btnGoToSignup').onclick = () => { hide('loginSection'); show('signupSection'); };
document.getElementById('btnGoToLogin').onclick = () => { hide('signupSection'); show('loginSection'); };

const updateProfileUI = (data, email) => {
    document.getElementById('pHeaderName').innerHTML = `${data.name || "Awaaz User"} <span><i class="fa-solid fa-circle-check"></i></span>`;
    document.getElementById('pEmail').innerText = data.email || email;
    document.getElementById('pGender').innerText = data.gender || "Not Set";
    document.getElementById('pAge').innerText = data.age ? data.age + " Yrs" : "Not Set";
    
    const updateTextField = (id, value) => {
        const el = document.getElementById(id);
        if(value && value.trim() !== "") { el.innerText = value; el.classList.remove("empty"); }
        else { el.innerText = "Add +"; el.classList.add("empty"); }
    };

    updateTextField('pPhone', data.phone);
    updateTextField('pCity', data.city);
    updateTextField('pPincode', data.pincode);
    updateTextField('pAddress', data.address);
    updateTextField('pGstin', data.gstin);
    document.getElementById('pLang').innerText = data.lang || "English";

    const updateSocialIcon = (id, value) => {
        const el = document.getElementById(id);
        if(value && value.trim() !== "") { el.classList.add("has-data"); }
        else { el.classList.remove("has-data"); }
    };

    updateSocialIcon('sWebsite', data.website);
    updateSocialIcon('sInstagram', data.instagram);
    updateSocialIcon('sFacebook', data.facebook);
    updateSocialIcon('sTwitter', data.twitter);
    updateSocialIcon('sTelegram', data.telegram);

    if(data.profilePic && data.profilePic !== "") { document.getElementById('userPhoto').src = data.profilePic; }
    else { document.getElementById('userPhoto').src = "https://via.placeholder.com/150/f8fafc/94a3b8?text=VIP"; }

    if(data.coverPic && data.coverPic !== "") { document.getElementById('coverPhotoBg').style.backgroundImage = `url(${data.coverPic})`; } 
    else { document.getElementById('coverPhotoBg').style.backgroundImage = `linear-gradient(135deg, #0f172a, #1e293b)`; }
};

window.editField = async (dbKey, displayName) => {
    if(!auth.currentUser) return;
    let localData = JSON.parse(localStorage.getItem("awaaz_user_data") || "{}");
    const currentUIValue = localData[dbKey] || "";
    const newVal = await window.openCustomPrompt(displayName, currentUIValue);
    
    if (newVal !== null) { 
        setLoader(`Saving ${displayName}...`, true);
        try {
            await updateDoc(doc(db, "nodes", auth.currentUser.uid), { [dbKey]: newVal });
            localData[dbKey] = newVal;
            localStorage.setItem("awaaz_user_data", JSON.stringify(localData));
            updateProfileUI(localData, auth.currentUser.email);
            showToast(`${displayName} Updated!`, "success");
        } catch(err) { showToast(`Failed to update ${displayName}`, "error"); }
        setLoader("", false);
    }
};

document.getElementById('loginForm').onsubmit = async (e) => {
    e.preventDefault(); setLoader("Authenticating...", true);
    try { await signInWithEmailAndPassword(auth, document.getElementById('logEmail').value, document.getElementById('logPass').value); showToast("Login Successful!", "success"); } 
    catch (err) { showToast("Invalid Credentials. Try again.", "error"); setLoader("", false); }
};

document.getElementById('signupForm').onsubmit = async (e) => {
    e.preventDefault(); setLoader("Setting up your Node...", true);
    try {
        const uc = await createUserWithEmailAndPassword(auth, document.getElementById('signEmail').value, document.getElementById('signPass').value);
        const newUserData = { 
            name: document.getElementById('signName').value, age: document.getElementById('signAge').value,
            gender: document.querySelector('input[name="gender"]:checked').value, email: document.getElementById('signEmail').value, 
            profilePic: "", coverPic: "", phone: "", city: "", pincode: "", address: "", gstin: "", lang: "English",
            website: "", facebook: "", instagram: "", twitter: "", telegram: ""
        };
        await setDoc(doc(db, "nodes", uc.user.uid), newUserData);
        localStorage.setItem("awaaz_user_data", JSON.stringify(newUserData));
        showToast("Account Created Successfully!", "success");
    } catch (err) { showToast(err.message, "error"); setLoader("", false); }
};

const handleGoogleAuth = async () => {
    setLoader("Connecting to Google...", true);
    try {
        const res = await signInWithPopup(auth, provider);
        const user = res.user;
        const docSnap = await getDoc(doc(db, "nodes", user.uid));
        if(!docSnap.exists()) {
            await setDoc(doc(db, "nodes", user.uid), { 
                name: user.displayName, email: user.email, profilePic: user.photoURL || "", coverPic: "", gender: "Not Set", age: "", 
                phone: "", city: "", pincode: "", address: "", gstin: "", lang: "English", website: "", facebook: "", instagram: "", twitter: "", telegram: ""
            });
        }
        showToast("Connected via Google!", "success");
    } catch(err) { if(err.code !== 'auth/popup-closed-by-user') showToast("Google Login Failed", "error"); setLoader("", false); }
};
document.getElementById('btnGoogleLogin').onclick = handleGoogleAuth;
document.getElementById('btnGoogleSignup').onclick = handleGoogleAuth;

document.getElementById('btnForgotPass').onclick = async () => {
    const email = document.getElementById('logEmail').value;
    if(!email) return showToast("Enter your email first!", "error");
    setLoader("Sending Reset Link...", true);
    try { await sendPasswordResetEmail(auth, email); showToast("Password reset link sent to email", "success"); }
    catch(err) { showToast("Email not found", "error"); }
    setLoader("", false);
};

onAuthStateChanged(auth, async (user) => {
    if(user) {
        hide('loginSection'); hide('signupSection'); show('profileSection');
        
        const localData = localStorage.getItem("awaaz_user_data");
        if(localData) updateProfileUI(JSON.parse(localData), user.email);

        try {
            const docSnap = await getDoc(doc(db, "nodes", user.uid));
            if(docSnap.exists()) {
                updateProfileUI(docSnap.data(), user.email);
                localStorage.setItem("awaaz_user_data", JSON.stringify(docSnap.data())); 
            }
        } catch(e) {}
        setLoader("", false);
    } else {
        localStorage.removeItem("awaaz_user_data");
        hide('profileSection'); show('loginSection');
        setLoader("", false);
    }
});

document.getElementById('btnLogout').onclick = () => {
    setLoader("Signing Out...", true);
    signOut(auth).then(() => { showToast("Signed Out Successfully", "success"); setLoader("", false); });
};
