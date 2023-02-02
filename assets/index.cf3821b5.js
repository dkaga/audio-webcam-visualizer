import*as l from"three";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const n of o)if(n.type==="childList")for(const s of n.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&r(s)}).observe(document,{childList:!0,subtree:!0});function a(o){const n={};return o.integrity&&(n.integrity=o.integrity),o.referrerpolicy&&(n.referrerPolicy=o.referrerpolicy),o.crossorigin==="use-credentials"?n.credentials="include":o.crossorigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function r(o){if(o.ep)return;o.ep=!0;const n=a(o);fetch(o.href,n)}})();var N=`attribute vec3 color;

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
}`;let h,y,m,q,x,A,g,c,w;const D=[],I=document.createElement("canvas"),v=I.getContext("2d"),W="loading",B=()=>"#"+(Math.random()*16777215<<0).toString(16).padStart(6,"0");let L={time:{type:"f",value:0},size:{type:"f",value:10}},M,z;const j=2048,C={bass:[20,140],lowMid:[140,400],mid:[400,2600],highMid:[2600,5200],treble:[5200,14e3]},U=()=>{var t;document.body.classList.add(W),h=new l.Scene,h.background=new l.Color(B()),y=new l.WebGLRenderer,(t=document.getElementById("content"))==null||t.appendChild(y.domElement),q=new l.Clock,V(),_(),navigator.mediaDevices?G():O(),k()},V=()=>{const e=x/A;m=new l.PerspectiveCamera(45,e,.1,1e4),m.position.set(0,0,900),m.lookAt(0,0,0),h.add(m)},G=()=>{g=document.getElementById("video"),g.autoplay=!0;const t={video:!0,audio:!0};navigator.mediaDevices.getUserMedia(t).then(e=>{K(e),e.removeTrack(e.getAudioTracks()[0]),g&&(g.srcObject=e,g.addEventListener("loadeddata",()=>{!g||J()}))}).catch(e=>{console.log(e),O()})},K=t=>{const e=new l.AudioListener;M=new l.Audio(e),M.setMediaStreamSource(t),M.gain.disconnect(),z=new l.AudioAnalyser(M,j)},$=t=>{const e=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);if(!!e)return{r:parseInt(e[1],16)/255,g:parseInt(e[2],16)/255,b:parseInt(e[3],16)/255}},J=()=>{const t=R(g);if(!t)return;const e=new l.BufferGeometry,a=new l.ShaderMaterial({uniforms:L,vertexShader:N,fragmentShader:T,transparent:!0,depthWrite:!1,blending:l.AdditiveBlending}),r=[],o=[];let n=Array.from(Array(Math.round(Math.random()*10))).map(()=>B());const s=3;for(let f=0,d=t.height;f<d;f+=s)for(let u=0,E=t.width;u<E;u+=s){let p=(u+f*E)*4;D.push(p);let F=(t.data[p]+t.data[p+1]+t.data[p+2])/3,H=F<300?F:1e4;r.push(u-t.width/2,-f+t.height/2,H);const b=$(n[Math.floor(Math.random()*n.length)]);if(!b)return;o.push(b.r,b.g,b.b)}const i=new Float32Array(r);e.setAttribute("position",new l.BufferAttribute(i,3));const P=new Float32Array(o);e.setAttribute("color",new l.BufferAttribute(P,3)),c=new l.Points(e,a),h.add(c)},R=(t,e=!1)=>{if(e&&w)return w;if(!t||!v)return;const a=t.videoWidth,r=t.videoHeight;return I.width=a,I.height=r,v.translate(a,0),v.scale(-1,1),v.drawImage(t,0,0),w=v.getImageData(0,0,a,r),w},S=(t,e)=>{const r=Math.round(e[0]/24e3*t.length),o=Math.round(e[1]/24e3*t.length);let n=0,s=0;for(let i=r;i<=o;i++)n+=t[i],s+=1;return n/s/255},k=t=>{q.getDelta(),L.time.value+=.5;let e,a,r;if(z){const o=z.getFrequencyData(),n=S(o,C.bass),s=S(o,C.mid),i=S(o,C.treble);e=n,a=s,r=i}if(c&&t){const o=t%2===0,n=R(g,o);if(!n)return;let s=0;for(let i=0,P=c.geometry.attributes.position.array.length;i<P;i+=3){let f=D[s],d=(n.data[f]+n.data[f+1]+n.data[f+2])/3,u=300;d<u&&typeof e<"u"&&typeof a<"u"&&typeof r<"u"?d<u/3?(c.geometry.attributes.position.array[i+2]=d*e*5,c.geometry.attributes.color.array[i+2]=u/d*e*10):d<u/2?(c.geometry.attributes.position.array[i+2]=d*a*5,c.geometry.attributes.color.array[i+2]=u/d*a*10):(c.geometry.attributes.position.array[i+2]=d*r*5,c.geometry.attributes.color.array[i+2]=u/d*r*10):c.geometry.attributes.position.array[i+2]=1e4,s++}e&&a&&r&&(L.size.value=(e+a+r)/3*35+5),c.geometry.attributes.position.needsUpdate=!0,c.geometry.attributes.color.needsUpdate=!0}y.render(h,m),requestAnimationFrame(k)},O=()=>{var t;(t=document.getElementById("message"))==null||t.classList.remove("hidden")},_=()=>{x=window.innerWidth,A=window.innerHeight,y.setPixelRatio(window.devicePixelRatio),y.setSize(x,A),m.aspect=x/A,m.updateProjectionMatrix()};window.addEventListener("resize",_);U();
