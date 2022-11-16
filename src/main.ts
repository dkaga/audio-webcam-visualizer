import * as THREE from 'three'
import vertexShader from './shader/vertexShader.vert';
import fragmentShader from './shader/fragmentShader.frag';

let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let camera: THREE.PerspectiveCamera;
let clock: THREE.Clock;
let width: number;
let height: number;
let video: HTMLVideoElement | null;
let particles: THREE.Points;
let imageCache: ImageData;


const particleIndexArray: number[] = [];

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

const classNameForLoading = "loading";

let uniforms = {
    time: {
        type: 'f',
        value: 0.0
    },
    size: {
        type: 'f',
        value: 10.0
    }
};

// audio
let audio: THREE.Audio;
let analyser: THREE.AudioAnalyser;
const fftSize = 2048;  // https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/fftSize
const frequencyRange = {
    bass: [20, 140],
    lowMid: [140, 400],
    mid: [400, 2600],
    highMid: [2600, 5200],
    treble: [5200, 14000],
};

const init = () => {
    document.body.classList.add(classNameForLoading);

    scene = new THREE.Scene();
    scene.background = new THREE.Color("#26b4d2");

    renderer = new THREE.WebGLRenderer();
    document.getElementById("content")?.appendChild(renderer.domElement);

    clock = new THREE.Clock();

    initCamera();

    onResize();

    if (navigator.mediaDevices) {
        initVideo();
    } else {
        showAlert();
    }

    draw();
};

const initCamera = () => {
    const fov = 45;
    const aspect = width / height;

    camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 10000);
    camera.position.set(0, 0, 900);
    camera.lookAt(0, 0, 0);

    scene.add(camera);
};

const initVideo = () => {
    video = document.getElementById("video") as HTMLVideoElement;
    video.autoplay = true;

    const option = {
        video: true,
        audio: true
    };
    navigator.mediaDevices.getUserMedia(option)
        .then((stream) => {
            initAudio(stream);
            stream.removeTrack(stream.getAudioTracks()[0])
			if (!video) return;
            video.srcObject = stream;
            video.addEventListener("loadeddata", () => {
                if (!video) return;

                createParticles();
            });
    })
    .catch((error) => {
        console.log(error);
        showAlert();
    });
};

const initAudio = (stream: MediaStream) => {
    const audioListener = new THREE.AudioListener();
    audio = new THREE.Audio(audioListener);
    audio.setMediaStreamSource(stream);
    
    audio.gain.disconnect();
    analyser = new THREE.AudioAnalyser(audio, fftSize);
};

// from https://stackoverflow.com/a/5624139
const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		if (!result) return;
    return {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
    };
};

const createParticles = () => {
    const imageData = getImageData(video);
		if (!imageData) return;
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const vertices: number[] = [];
    const colors: number[] = [];

    let colorsPerFace = [
        "#ff4b78", "#16e36d", "#162cf8", "#2016e3"
    ];

    let count = 0;
    const step = 3;
    for (let y = 0, height = imageData.height; y < height; y += step) {
			for (let x = 0, width = imageData.width; x < width; x += step) {
					// let index = (count) * 4 * step;
					let index = (x + y * width) * 4;
					particleIndexArray.push(index);

					let gray = (imageData.data[index] + imageData.data[index + 1] + imageData.data[index + 2]) / 3;
					let z = gray < 300 ? gray : 10000;

					vertices.push(
							x - imageData.width / 2,
							-y + imageData.height / 2,
							z
					);

					const rgbColor = hexToRgb(colorsPerFace[Math.floor(Math.random() * colorsPerFace.length)]);
					if (!rgbColor) return;
					colors.push(rgbColor.r, rgbColor.g, rgbColor.b);

					count++;
			}
	}

    const verticesArray = new Float32Array(vertices);
    geometry.setAttribute('position', new THREE.BufferAttribute(verticesArray, 3));

    const colorsArray = new Float32Array(colors);
    geometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
};

const getImageData = (image: HTMLVideoElement | null, useCache = false) => {
    if (useCache && imageCache) {
        return imageCache;
    }

		if (!image || !ctx) return;

    const w = image.videoWidth;
    const h = image.videoHeight;

    canvas.width = w;
    canvas.height = h;

    ctx.translate(w, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(image, 0, 0);
    imageCache = ctx.getImageData(0, 0, w, h);

    return imageCache;
};

/**
 * https://github.com/processing/p5.js-sound/blob/v0.14/lib/p5.sound.js#L1765
 *
 * @param data
 * @param _frequencyRange
 * @returns {number} 0.0 ~ 1.0
 */
const getFrequencyRangeValue = (data: Uint8Array, _frequencyRange: number[]) => {
    const nyquist = 48000 / 2;
    const lowIndex = Math.round(_frequencyRange[0] / nyquist * data.length);
    const highIndex = Math.round(_frequencyRange[1] / nyquist * data.length);
    let total = 0;
    let numFrequencies = 0;

    for (let i = lowIndex; i <= highIndex; i++) {
        total += data[i];
        numFrequencies += 1;
    }
    return total / numFrequencies / 255;
};

const draw = (t?: number) => {
    clock.getDelta();
    const time = clock.elapsedTime;

    uniforms.time.value += 0.5;

    let r, g, b;

    // audio
    if (analyser) {
        // analyser.getFrequencyData() would be an array with a size of half of fftSize.
        const data = analyser.getFrequencyData();

        const bass = getFrequencyRangeValue(data, frequencyRange.bass);
        const mid = getFrequencyRangeValue(data, frequencyRange.mid);
        const treble = getFrequencyRangeValue(data, frequencyRange.treble);

        r = bass;
        g = mid;
        b = treble;
    }

    // video
    if (particles && t) {
        const useCache = t % 2 === 0;  // To reduce CPU usage.
        const imageData = getImageData(video, useCache);
				if (!imageData) return;
        let count = 0;

        for (let i = 0, length = particles.geometry.attributes.position.array.length; i < length; i += 3) {
            let index = particleIndexArray[count];
            let gray = (imageData.data[index] + imageData.data[index + 1] + imageData.data[index + 2]) / 3;
            let threshold = 300;
            if (gray < threshold && typeof r != 'undefined' && typeof g != 'undefined' && typeof b != 'undefined') {
                if (gray < threshold / 3) {
                    particles.geometry.attributes.position.array[i + 2] = gray * r * 5;

                } else if (gray < threshold / 2) {
                    particles.geometry.attributes.position.array[i + 2] = gray * g * 5;

                } else {
                    particles.geometry.attributes.position.array[i + 2] = gray * b * 5;
                }
            } else {
                particles.geometry.attributes.position.array[i + 2] = 10000;
            }

            count++;
        }

        if (r && g && b) uniforms.size.value = (r + g + b) / 3 * 35 + 5;

        particles.geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);

    requestAnimationFrame(draw);
};

const showAlert = () => {
    document.getElementById("message")?.classList.remove("hidden");
};

const onResize = () => {
    width = window.innerWidth;
    height = window.innerHeight;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
};

window.addEventListener("resize", onResize);

init();
