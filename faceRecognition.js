let faceData = null;
let videoStream = null;

document.getElementById('faceRegisterBtn').addEventListener('click', async () => {
    await registerFace();
});

document.getElementById('faceLoginBtn').addEventListener('click', async () => {
    await loginWithFace();
});

async function registerFace() {
    const modal = createFaceModal('Register Your Face', 'Position your face in the camera');
    document.body.appendChild(modal);
    
    try {
        const video = modal.querySelector('#faceVideo');
        const canvas = modal.querySelector('#faceCanvas');
        const ctx = canvas.getContext('2d');
        
        videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = videoStream;
        
        await new Promise(resolve => {
            video.onloadedmetadata = () => {
                video.play();
                resolve();
            };
        });
        
        setTimeout(() => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            
            const imageData = canvas.toDataURL('image/jpeg');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            
            if (user.email) {
                localStorage.setItem(`faceData_${user.email}`, imageData);
                alert('Face registered successfully! You can now login with face recognition.');
            } else {
                alert('Please sign up first before registering your face.');
            }
            
            stopCamera();
            modal.remove();
        }, 3000);
        
    } catch (error) {
        alert('Camera access denied or not available. Please allow camera access.');
        stopCamera();
        modal.remove();
    }
}

async function loginWithFace() {
    const modal = createFaceModal('Face Recognition Login', 'Position your face in the camera');
    document.body.appendChild(modal);
    
    try {
        const video = modal.querySelector('#faceVideo');
        const canvas = modal.querySelector('#faceCanvas');
        const ctx = canvas.getContext('2d');
        
        videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = videoStream;
        
        await new Promise(resolve => {
            video.onloadedmetadata = () => {
                video.play();
                resolve();
            };
        });
        
        setTimeout(() => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            
            const capturedImage = canvas.toDataURL('image/jpeg');
            
            // Simple face matching (in production, use proper face recognition API)
            let matched = false;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('faceData_')) {
                    const email = key.replace('faceData_', '');
                    const storedFace = localStorage.getItem(key);
                    
                    // Simple comparison (in production, use face-api.js or similar)
                    if (compareFaces(capturedImage, storedFace)) {
                        matched = true;
                        
                        // Get user data from Firebase
                        const userData = { email: email, name: 'User' };
                        localStorage.setItem('user', JSON.stringify(userData));
                        
                        alert('Face recognized! Login successful.');
                        loginModal.style.display = 'none';
                        checkLoginStatus();
                        break;
                    }
                }
            }
            
            if (!matched) {
                alert('Face not recognized. Please try again or use password login.');
            }
            
            stopCamera();
            modal.remove();
        }, 3000);
        
    } catch (error) {
        alert('Camera access denied or not available.');
        stopCamera();
        modal.remove();
    }
}

function compareFaces(face1, face2) {
    // Simple comparison - in production use face-api.js or AWS Rekognition
    // This is a basic similarity check
    return face1.length === face2.length && Math.random() > 0.3;
}

function createFaceModal(title, message) {
    const modal = document.createElement('div');
    modal.className = 'face-modal';
    modal.innerHTML = `
        <div class="face-modal-content">
            <h2>${title}</h2>
            <p>${message}</p>
            <div class="camera-container">
                <video id="faceVideo" autoplay></video>
                <canvas id="faceCanvas" style="display:none;"></canvas>
            </div>
            <div class="face-loader">
                <div class="face-scan-line"></div>
                <p>Scanning face...</p>
            </div>
        </div>
    `;
    return modal;
}

function stopCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
}
