const layers = [document.getElementById('bg1'), document.getElementById('bg2')];
let currentIdx = 0;
let isChanging = false;

function getNewPhoto() {
    return `https://picsum.photos/1080/1920?random=${Math.random()}`;
}

function triggerPhotoChange() {
    if (isChanging) return;
    isChanging = true;
    document.getElementById('loader-line').style.width = '50%';
    
    const nextIdx = (currentIdx + 1) % 2;
    const img = new Image();
    img.src = getNewPhoto();
    img.onload = () => {
        layers[nextIdx].src = img.src;
        layers[nextIdx].classList.add('active');
        layers[currentIdx].classList.remove('active');
        currentIdx = nextIdx;
        isChanging = false;
        document.getElementById('loader-line').style.width = '100%';
        setTimeout(() => { document.getElementById('loader-line').style.width = '0'; }, 300);
    };
}

window.addEventListener('touchend', e => {
    if(e.target.closest('#handle')) return; // Slider handle par swipe ignore karein
    triggerPhotoChange();
});

layers[0].src = getNewPhoto();

const handle = document.getElementById('handle');
const slider = document.getElementById('slider');
const target = document.getElementById('target');
let drag = false, xStart = 0;
const limit = slider.offsetWidth - handle.offsetWidth - 12;

const onStart = (e) => {
    drag = true;
    xStart = (e.type.includes('touch')) ? e.touches[0].clientX : e.clientX;
};

const onMove = (e) => {
    if (!drag) return;
    let currentX = (e.type.includes('touch')) ? e.touches[0].clientX : e.clientX;
    let move = currentX - xStart;
    if (move < 0) move = 0;
    if (move > limit) move = limit;
    handle.style.left = (move + 6) + "px";
    if (move > limit - 15) target.classList.add('glow');
    else target.classList.remove('glow');
};

const onEnd = () => {
    if (!drag) return;
    drag = false;
    if (parseInt(handle.style.left) >= limit) {
        setTimeout(() => { window.location.href = 'AZ/home.html'; }, 300);
    } else {
        handle.style.left = '6px';
        target.classList.remove('glow');
    }
};

handle.addEventListener('touchstart', onStart);
window.addEventListener('touchmove', onMove);
window.addEventListener('touchend', onEnd);
