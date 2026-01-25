// Dynamic import handled in init()
// import { InstallButton } from 'https://unpkg.com/esp-web-tools@10/dist/web/install-button.js?module';

// ==========================================
// 3D BACKGROUND LOGIC (Three.js)
// ==========================================

let scene, camera, renderer, cube, cage, particles;
const canvasContainer = document.getElementById('canvas-container');

function initThreeJS() {
    if (!canvasContainer) return;

    // 1. Scene & Camera
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0f19, 0.002);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // 2. Renderer
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    canvasContainer.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00f2ff, 1, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x7000ff, 1, 100);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);

    // 4. Objects
    createTechCube();
    createParticles();

    // 5. Events
    window.addEventListener('resize', onWindowResize);

    // 6. Start Loop
    animate();
}

function createCircuitTexture() {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, size, size);

    // Grid lines (subtle)
    ctx.strokeStyle = 'rgba(0, 242, 255, 0.1)';
    ctx.lineWidth = 1;
    const step = 64;
    for(let i=0; i<size; i+=step) {
        ctx.beginPath();
        ctx.moveTo(i, 0); ctx.lineTo(i, size);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i); ctx.lineTo(size, i);
        ctx.stroke();
    }

    // Random Circuit Paths
    ctx.strokeStyle = '#00f2ff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00f2ff';

    const numPaths = 40;
    for(let i=0; i<numPaths; i++) {
        const x = Math.floor(Math.random() * (size/step)) * step;
        const y = Math.floor(Math.random() * (size/step)) * step;
        const length = Math.random() * 200 + 50;
        const dir = Math.random() > 0.5 ? 'h' : 'v';

        ctx.beginPath();
        ctx.moveTo(x, y);
        if(dir === 'h') ctx.lineTo(x + length, y);
        else ctx.lineTo(x, y + length);
        ctx.stroke();

        // Add "Chips" at ends
        ctx.fillStyle = 'rgba(0, 242, 255, 0.8)';
        ctx.fillRect(x - 4, y - 4, 8, 8);
    }

    // Big Chip in middle
    ctx.fillStyle = 'rgba(0, 50, 80, 0.8)';
    ctx.strokeStyle = '#00f2ff';
    ctx.lineWidth = 4;
    ctx.fillRect(size/2 - 100, size/2 - 100, 200, 200);
    ctx.strokeRect(size/2 - 100, size/2 - 100, 200, 200);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

function createTechCube() {
    // A. Main Cube
    const geometry = new THREE.BoxGeometry(2.5, 2.5, 2.5);
    const texture = createCircuitTexture();

    const material = new THREE.MeshStandardMaterial({
        map: texture,
        color: 0xffffff,
        emissive: 0x004455,
        emissiveMap: texture,
        emissiveIntensity: 0.8,
        roughness: 0.2,
        metalness: 0.8,
        transparent: true,
        opacity: 0.9
    });

    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // B. Wireframe Cage
    const cageGeo = new THREE.BoxGeometry(2.8, 2.8, 2.8);
    const cageMat = new THREE.MeshBasicMaterial({
        color: 0x00f2ff,
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });
    cage = new THREE.Mesh(cageGeo, cageMat);
    scene.add(cage);
}

function createParticles() {
    const particlesGeo = new THREE.BufferGeometry();
    const count = 800;
    const posArray = new Float32Array(count * 3);

    for(let i=0; i<count * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 20;
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMat = new THREE.PointsMaterial({
        size: 0.05,
        color: 0x00f2ff,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);
}

function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    if(window.innerWidth < 768) {
        camera.position.z = 6.5;
    } else {
        camera.position.z = 5;
    }
}

function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.0005;

    // Rotate Cube
    if (cube) {
        cube.rotation.x += 0.0015;
        cube.rotation.y += 0.002;
    }

    // Rotate Cage (Inverse)
    if (cage) {
        cage.rotation.x -= 0.001;
        cage.rotation.y -= 0.001;
    }

    // Float Particles
    if (particles) {
        particles.rotation.y = time * 0.04;
    }

    renderer.render(scene, camera);
}


// ==========================================
// APPLICATION LOGIC
// ==========================================

// Views
const landingPage = document.getElementById('landing-page');
const appPage = document.getElementById('app-page');
const btnEnterApp = document.getElementById('btn-enter-app');
const btnBackHome = document.getElementById('btn-back-home');

// DOM Elements
const customFileArea = document.getElementById('custom-file-area');
const fileInput = document.getElementById('file-upload');
const fileInfo = document.getElementById('file-info');
const installButton = document.getElementById('install-button');

// Project Selection Elements
const btnChangeProject = document.getElementById('btn-change-project');
const modalPicker = document.getElementById('firmware-picker-modal');
const btnClosePicker = document.getElementById('btn-close-picker');
const projectGrid = document.getElementById('project-grid');
const selectedProjectName = document.getElementById('selected-project-name');
const selectedProjectDesc = document.getElementById('selected-project-desc');
const projectDisplayArea = document.getElementById('project-display-area');

// Serial Elements
const btnConnect = document.getElementById('btn-serial-connect');
const btnReset = document.getElementById('btn-reset');
const baudRateSelect = document.getElementById('baud-rate');
const btnClear = document.getElementById('btn-clear-logs');
const btnDownload = document.getElementById('btn-download-logs');
const chkAutoscroll = document.getElementById('chk-autoscroll');
const chkTimestamp = document.getElementById('chk-timestamp');
const consoleOutput = document.getElementById('console');
const serialInput = document.getElementById('serial-input');
const btnSend = document.getElementById('btn-send');
const serialStatus = document.getElementById('serial-status');

// Settings Elements
const btnSettings = document.getElementById('btn-settings');
const modalSettings = document.getElementById('settings-modal');
const btnCloseSettings = document.getElementById('btn-close-settings');
const btnSaveSettings = document.getElementById('btn-save-settings');
const settingBaud = document.getElementById('setting-baud');
const settingMaxLines = document.getElementById('setting-max-lines');
const settingRemember = document.getElementById('setting-remember');

// State
let manifest = null;
let currentFirmware = null;
let port = null;
let reader = null;
let writer = null;
let readableStreamClosed = null;
let textEncoder = new TextEncoder();
let buffer = '';
let maxLogLines = 1000;

// --- UI HELPERS ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconClass = 'ph-info';
    if (type === 'success') iconClass = 'ph-check-circle';
    if (type === 'error') iconClass = 'ph-warning-circle';

    toast.innerHTML = `<i class="ph ${iconClass} toast-icon"></i><span class="toast-message">${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s forwards';
        toast.addEventListener('animationend', () => {
            if (toast.parentElement) toast.parentElement.removeChild(toast);
        });
    }, 3000);
}

const log = (msg, type = 'system') => {
    const div = document.createElement('div');
    div.className = `log-line ${type}`;

    const now = new Date();
    const timeStr = `[${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}.${now.getMilliseconds().toString().padStart(3,'0')}]`;

    const spanTs = document.createElement('span');
    spanTs.className = 'ts';
    if (!chkTimestamp.checked) spanTs.classList.add('hidden-ts');
    spanTs.textContent = timeStr;

    const spanMsg = document.createElement('span');
    spanMsg.textContent = " " + msg;

    div.appendChild(spanTs);
    div.appendChild(spanMsg);

    consoleOutput.appendChild(div);

    while (consoleOutput.children.length > maxLogLines) {
        consoleOutput.removeChild(consoleOutput.firstChild);
    }

    if (chkAutoscroll.checked) {
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }
};

function updateSerialStatus(isConnected) {
    if (isConnected) {
        serialStatus.classList.add('connected');
        serialStatus.innerHTML = '<span class="status-dot"></span> Connected';

        btnConnect.innerHTML = '<i class="ph ph-plug"></i> Disconnect';
        btnConnect.classList.replace('secondary-btn', 'primary-btn');
    } else {
        serialStatus.classList.remove('connected');
        serialStatus.innerHTML = '<span class="status-dot"></span> Disconnected';

        btnConnect.innerHTML = '<i class="ph ph-plug"></i> Connect';
        btnConnect.classList.replace('primary-btn', 'secondary-btn');
    }
}

// --- INITIALIZATION ---
async function init() {
    try {
        await import('https://unpkg.com/esp-web-tools@10/dist/web/install-button.js?module');
    } catch (e) {
        console.warn("ESP Web Tools could not be loaded:", e);
    }

    initThreeJS();
    loadSettings();

    try {
        const response = await fetch('manifest.json');
        manifest = await response.json();
        populateFirmwareGrid();
        setupEventListeners();
    } catch (error) {
        log('Failed to load manifest: ' + error.message, 'error');
        showToast('Failed to load manifest', 'error');
    }
}

// --- SETTINGS ---
function loadSettings() {
    const saved = localStorage.getItem('esp_tools_settings');
    if (saved) {
        const config = JSON.parse(saved);
        if (config.baud) {
            baudRateSelect.value = config.baud;
            settingBaud.value = config.baud;
        }
        if (config.maxLines) {
            maxLogLines = parseInt(config.maxLines);
            settingMaxLines.value = maxLogLines;
        }
        if (config.remember !== undefined) settingRemember.checked = config.remember;
    }
}

function saveSettings() {
    if (!settingRemember.checked) {
        localStorage.removeItem('esp_tools_settings');
    } else {
        const config = {
            baud: settingBaud.value,
            maxLines: settingMaxLines.value,
            remember: settingRemember.checked
        };
        localStorage.setItem('esp_tools_settings', JSON.stringify(config));
    }

    baudRateSelect.value = settingBaud.value;
    maxLogLines = parseInt(settingMaxLines.value);

    modalSettings.classList.add('hidden');
    showToast('Configuration saved', 'success');
}

// --- FLASHER LOGIC ---

// New Grid Generation Logic
function populateFirmwareGrid() {
    projectGrid.innerHTML = '';

    if (manifest && manifest.firmwares) {
        manifest.firmwares.forEach((fw, index) => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.dataset.index = index;
            card.dataset.type = 'manifest';

            // Icon logic (random or specific if we had metadata)
            const iconClass = index % 2 === 0 ? 'ph-rocket' : 'ph-planet';

            card.innerHTML = `
                <i class="ph ${iconClass} project-card-icon"></i>
                <div class="project-card-title">${fw.name}</div>
                <div class="project-card-chip">Firmware</div>
            `;

            card.addEventListener('click', () => selectProject(index, 'manifest'));
            projectGrid.appendChild(card);
        });
    }

    // Custom Upload Card
    const customCard = document.createElement('div');
    customCard.className = 'project-card';
    customCard.dataset.type = 'custom';
    customCard.innerHTML = `
        <i class="ph ph-upload-simple project-card-icon" style="color: var(--accent-orange);"></i>
        <div class="project-card-title">Custom Upload</div>
        <div class="project-card-chip" style="color: var(--accent-orange); background: rgba(255,157,0,0.1);">.bin File</div>
    `;
    customCard.addEventListener('click', () => selectProject(null, 'custom'));
    projectGrid.appendChild(customCard);
}

function selectProject(index, type) {
    if (port) {
        showToast('Please disconnect Serial Monitor to flash', 'error');
        return; // Don't allow changing if connected
    }

    // Reset UI
    installButton.manifest = null;
    currentFirmware = null;

    // Highlight active card
    document.querySelectorAll('.project-card').forEach(c => c.classList.remove('active'));
    // Find the card that was clicked (based on type/index)
    // Note: Since we are inside the click handler, we could pass 'this' but simple query works too

    if (type === 'custom') {
        customFileArea.style.display = 'block';
        installButton.classList.add('hidden');
        fileInput.value = '';
        fileInfo.textContent = '';

        selectedProjectName.textContent = "Custom Firmware";
        selectedProjectDesc.textContent = "Upload a .bin file manually";

    } else {
        customFileArea.style.display = 'none';
        const fw = manifest.firmwares[index];
        currentFirmware = fw;
        setupInstallButton(fw.manifest_path);

        selectedProjectName.textContent = fw.name;
        selectedProjectDesc.textContent = "Ready to flash";
    }

    // Close Modal
    modalPicker.classList.add('hidden');
    updateInstallButtonState();
}


function setupInstallButton(manifestPath) {
    const fullPath = new URL(manifestPath, window.location.href).href;
    installButton.manifest = fullPath;
    log(`Selected firmware: ${currentFirmware.name}`, 'system');
}

function updateInstallButtonState() {
    if ((currentFirmware || installButton.manifest) && !port) {
        installButton.classList.remove('hidden');
    } else {
        installButton.classList.add('hidden');
    }
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.bin')) {
        showToast('Invalid file type (only .bin)', 'error');
        fileInfo.textContent = 'Invalid file type';
        return;
    }

    fileInfo.classList.remove('hidden');
    fileInfo.innerHTML = `
        <div style="text-align: center; margin-bottom: 10px;">
            <p><i class="ph ph-check-circle" style="color: #4CAF50; font-size: 1.5rem; vertical-align: middle;"></i> Loaded: <strong>${file.name}</strong> (${(file.size / 1024).toFixed(1)} KB)</p>
            <p style="font-size: 0.9rem; opacity: 0.8; margin-top: 5px;">👇 Click <strong>INSTALL</strong> below to flash.</p>
        </div>
    `;
    showToast(`Loaded ${file.name}`, 'success');

    const fileUrl = URL.createObjectURL(file);
    const generatedManifest = {
        name: "Custom Firmware",
        version: "1.0.0",
        builds: [
            { chipFamily: "ESP32", parts: [{ path: fileUrl, offset: 0x0 }] },
            { chipFamily: "ESP8266", parts: [{ path: fileUrl, offset: 0x0 }] },
            { chipFamily: "ESP32-S2", parts: [{ path: fileUrl, offset: 0x0 }] },
            { chipFamily: "ESP32-S3", parts: [{ path: fileUrl, offset: 0x0 }] },
            { chipFamily: "ESP32-C3", parts: [{ path: fileUrl, offset: 0x0 }] },
            { chipFamily: "ESP32-C6", parts: [{ path: fileUrl, offset: 0x0 }] }
        ]
    };

    const manifestBlob = new Blob([JSON.stringify(generatedManifest)], {type: "application/json"});
    installButton.manifest = URL.createObjectURL(manifestBlob);
    updateInstallButtonState();
}

// --- SERIAL MONITOR LOGIC ---

async function toggleConnect() {
    if (port) {
        await disconnectSerial();
    } else {
        await connectSerial();
    }
}

async function connectSerial() {
    if (!('serial' in navigator)) {
        alert('Web Serial API not supported.');
        return;
    }

    try {
        port = await navigator.serial.requestPort();
        const baudRate = parseInt(baudRateSelect.value);
        await port.open({ baudRate });

        log(`Connected at ${baudRate} baud.`, 'success');
        showToast('Connected to Serial Port', 'success');

        updateSerialStatus(true);

        serialInput.disabled = false;
        btnSend.disabled = false;
        btnReset.disabled = false;

        updateInstallButtonState();
        readLoop();

    } catch (err) {
        log('Error connecting: ' + err.message, 'error');
        showToast('Connection failed', 'error');
    }
}

async function disconnectSerial() {
    if (port) {
        try {
            if (reader) {
                await reader.cancel();
                await readableStreamClosed.catch(() => {});
                reader = null;
            }
            if (writer) {
                writer.releaseLock();
                writer = null;
            }
            await port.close();

            if (buffer.length > 0) {
                log(buffer + ' [Incomplete]', 'in');
                buffer = '';
            }

        } catch (e) {
            console.error(e);
        }

        port = null;
        log('Disconnected.', 'system');
        showToast('Disconnected', 'info');

        updateSerialStatus(false);

        serialInput.disabled = true;
        btnSend.disabled = true;
        btnReset.disabled = true;

        updateInstallButtonState();
    }
}

async function resetDevice() {
    if (!port) return;
    try {
        await port.setSignals({ dataTerminalReady: false, requestToSend: true });
        await new Promise(r => setTimeout(r, 100));
        await port.setSignals({ dataTerminalReady: false, requestToSend: false });

        showToast('Reset signal sent', 'success');
        log('Sent Reset Signal (RTS Pulse)', 'system');
    } catch (err) {
        showToast('Reset failed: ' + err.message, 'error');
    }
}

async function readLoop() {
    const textDecoder = new TextDecoderStream();
    readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    reader = textDecoder.readable.getReader();

    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) {
                processIncomingData(value);
            }
        }
    } catch (err) {
        log('Read error: ' + err.message, 'error');
    } finally {
        reader.releaseLock();
    }
}

function processIncomingData(chunk) {
    buffer += chunk;
    const lines = buffer.split('\n');
    buffer = lines.pop();

    lines.forEach(line => {
        const cleanLine = line.replace(/\r$/, '');
        if (cleanLine) log(cleanLine, 'in');
    });
}

async function sendData() {
    if (!port || !port.writable) return;

    const text = serialInput.value;
    if (!text) return;

    try {
        const writer = port.writable.getWriter();
        await writer.write(textEncoder.encode(text + '\n'));
        writer.releaseLock();

        log(`> ${text}`, 'out');
        serialInput.value = '';
    } catch (err) {
        log('Send error: ' + err.message, 'error');
        showToast('Failed to send data', 'error');
    }
}

function downloadLogs() {
    const lines = Array.from(consoleOutput.querySelectorAll('.log-line'))
        .map(div => div.innerText)
        .join('\n');

    const blob = new Blob([lines], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `serial-log-${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// --- EVENTS ---
function setupEventListeners() {
    // Replaced productSelect.addEventListener with modal logic

    fileInput.addEventListener('change', handleFileUpload);

    btnConnect.addEventListener('click', toggleConnect);
    btnReset.addEventListener('click', resetDevice);

    btnSend.addEventListener('click', sendData);
    serialInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendData();
    });

    btnClear.addEventListener('click', () => {
        consoleOutput.innerHTML = '';
        log('Logs cleared.', 'system');
        showToast('Logs cleared');
    });

    btnDownload.addEventListener('click', downloadLogs);

    chkTimestamp.addEventListener('change', (e) => {
        const spans = document.querySelectorAll('.ts');
        spans.forEach(span => {
            if (e.target.checked) span.classList.remove('hidden-ts');
            else span.classList.add('hidden-ts');
        });
    });

    // Settings Modal
    btnSettings.addEventListener('click', () => modalSettings.classList.remove('hidden'));
    btnCloseSettings.addEventListener('click', () => modalSettings.classList.add('hidden'));
    btnSaveSettings.addEventListener('click', saveSettings);
    modalSettings.addEventListener('click', (e) => {
        if (e.target === modalSettings) modalSettings.classList.add('hidden');
    });

    // Firmware Picker Modal
    btnChangeProject.addEventListener('click', () => modalPicker.classList.remove('hidden'));
    btnClosePicker.addEventListener('click', () => modalPicker.classList.add('hidden'));
    modalPicker.addEventListener('click', (e) => {
        if (e.target === modalPicker) modalPicker.classList.add('hidden');
    });

    // Navigation (Landing -> App)
    btnEnterApp.addEventListener('click', () => {
        landingPage.classList.add('slide-up');

        setTimeout(() => {
            appPage.classList.add('active');
        }, 800);
    });

    // Navigation (App -> Home) (Optional, if we want a back button)
    if (btnBackHome) {
        btnBackHome.addEventListener('click', () => {
            appPage.classList.remove('active');
            appPage.classList.add('hidden-section');

            setTimeout(() => {
                landingPage.classList.remove('slide-up');
            }, 300);
        });
    }
}

// Start
init();
