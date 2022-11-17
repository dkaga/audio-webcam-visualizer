import*as l from"three";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))r(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const a of o.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function i(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerpolicy&&(o.referrerPolicy=n.referrerpolicy),n.crossorigin==="use-credentials"?o.credentials="include":n.crossorigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(n){if(n.ep)return;n.ep=!0;const o=i(n);fetch(n.href,o)}})();var N=`attribute vec3 color;

uniform float time;
uniform float size;

varying vec4 vMvPosition;
varying vec3 vColor;

float map(float value, float beforeMin, float beforeMax, float afterMin, float afterMax) {
    return afterMin + (afterMax - afterMin) * ((value - beforeMin) / (beforeMax - beforeMin));
}

void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vMvPosition = mvPosition;
    vColor = color;

    
    gl_PointSize = size;
    gl_Position = projectionMatrix * mvPosition;
}`,T=`uniform float time;

varying vec4 vMvPosition;
varying vec3 vColor;

void main() {
    vec2 uv = gl_PointCoord.xy * 2.0 - 1.0;

    float orb = 0.1 / length(uv * 1.0);
    orb = smoothstep(0.0, 1.0, orb);

    vec3 color = vec3(orb) * vColor;

    gl_FragColor = vec4(color, 1.0);
}`;let h,y,m,q,x,A,g,c,w;const D=[],L=document.createElement("canvas"),v=L.getContext("2d"),W="loading";let S={time:{type:"f",value:0},size:{type:"f",value:10}},M,z;const j=2048,C={bass:[20,140],lowMid:[140,400],mid:[400,2600],highMid:[2600,5200],treble:[5200,14e3]},H=()=>{var e;document.body.classList.add(W),h=new l.Scene,h.background=new l.Color("#26b4d2"),y=new l.WebGLRenderer,(e=document.getElementById("content"))==null||e.appendChild(y.domElement),q=new l.Clock,V(),O(),navigator.mediaDevices?G():k(),R()},V=()=>{const t=x/A;m=new l.PerspectiveCamera(45,t,.1,1e4),m.position.set(0,0,900),m.lookAt(0,0,0),h.add(m)},G=()=>{g=document.getElementById("video"),g.autoplay=!0;const e={video:!0,audio:!0};navigator.mediaDevices.getUserMedia(e).then(t=>{U(t),t.removeTrack(t.getAudioTracks()[0]),g&&(g.srcObject=t,g.addEventListener("loadeddata",()=>{!g||$()}))}).catch(t=>{console.log(t),k()})},U=e=>{const t=new l.AudioListener;M=new l.Audio(t),M.setMediaStreamSource(e),M.gain.disconnect(),z=new l.AudioAnalyser(M,j)},K=e=>{const t=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);if(!!t)return{r:parseInt(t[1],16)/255,g:parseInt(t[2],16)/255,b:parseInt(t[3],16)/255}},$=()=>{const e=B(g);if(!e)return;const t=new l.BufferGeometry,i=new l.ShaderMaterial({uniforms:S,vertexShader:N,fragmentShader:T,transparent:!0,depthWrite:!1,blending:l.AdditiveBlending}),r=[],n=[];let o=["#ff4b78","#16e36d","#162cf8","#2016e3"];const a=3;for(let d=0,u=e.height;d<u;d+=a)for(let f=0,E=e.width;f<E;f+=a){let p=(f+d*E)*4;D.push(p);let F=(e.data[p]+e.data[p+1]+e.data[p+2])/3,_=F<300?F:1e4;r.push(f-e.width/2,-d+e.height/2,_);const b=K(o[Math.floor(Math.random()*o.length)]);if(!b)return;n.push(b.r,b.g,b.b)}const s=new Float32Array(r);t.setAttribute("position",new l.BufferAttribute(s,3));const P=new Float32Array(n);t.setAttribute("color",new l.BufferAttribute(P,3)),c=new l.Points(t,i),h.add(c)},B=(e,t=!1)=>{if(t&&w)return w;if(!e||!v)return;const i=e.videoWidth,r=e.videoHeight;return L.width=i,L.height=r,v.translate(i,0),v.scale(-1,1),v.drawImage(e,0,0),w=v.getImageData(0,0,i,r),w},I=(e,t)=>{const r=Math.round(t[0]/24e3*e.length),n=Math.round(t[1]/24e3*e.length);let o=0,a=0;for(let s=r;s<=n;s++)o+=e[s],a+=1;return o/a/255},R=e=>{q.getDelta(),S.time.value+=.5;let t,i,r;if(z){const n=z.getFrequencyData(),o=I(n,C.bass),a=I(n,C.mid),s=I(n,C.treble);t=o,i=a,r=s}if(c&&e){const n=e%2===0,o=B(g,n);if(!o)return;let a=0;for(let s=0,P=c.geometry.attributes.position.array.length;s<P;s+=3){let d=D[a],u=(o.data[d]+o.data[d+1]+o.data[d+2])/3,f=300;u<f&&typeof t<"u"&&typeof i<"u"&&typeof r<"u"?u<f/3||u<f/2?c.geometry.attributes.position.array[s+2]=u*i*5:c.geometry.attributes.position.array[s+2]=u*r*5:c.geometry.attributes.position.array[s+2]=1e4,a++}t&&i&&r&&(S.size.value=(t+i+r)/3*35+5),c.geometry.attributes.position.needsUpdate=!0}y.render(h,m),requestAnimationFrame(R)},k=()=>{var e;(e=document.getElementById("message"))==null||e.classList.remove("hidden")},O=()=>{x=window.innerWidth,A=window.innerHeight,y.setPixelRatio(window.devicePixelRatio),y.setSize(x,A),m.aspect=x/A,m.updateProjectionMatrix()};window.addEventListener("resize",O);H();
