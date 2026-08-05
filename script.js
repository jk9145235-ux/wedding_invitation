/*=====================================
        LOADER
=====================================*/

window.addEventListener("load", () => {

setTimeout(() => {

document.getElementById("loader").style.display = "none";

},3000);

});

/*=====================================
      OPEN INVITATION
=====================================*/

const openBtn=document.getElementById("openInvite");

if(openBtn){

openBtn.addEventListener("click",()=>{

document.querySelector(".scratch-section").scrollIntoView({

behavior:"smooth"

});

});

}

/*=====================================
        COUNTDOWN
=====================================*/

const weddingDate=new Date("November 17, 2026 00:00:00").getTime();

setInterval(()=>{

const now=new Date().getTime();

const distance=weddingDate-now;

const days=Math.floor(distance/(1000*60*60*24));

const hours=Math.floor((distance%(1000*60*60*24))/(1000*60*60));

const minutes=Math.floor((distance%(1000*60*60))/(1000*60));

const seconds=Math.floor((distance%(1000*60))/1000);

document.getElementById("days").innerHTML=days;

document.getElementById("hours").innerHTML=hours;

document.getElementById("minutes").innerHTML=minutes;

document.getElementById("seconds").innerHTML=seconds;

},1000);

/*=====================================
        MUSIC
=====================================*/

const music=document.getElementById("music");

const musicBtn=document.getElementById("musicBtn");

let playing=false;

if(musicBtn){

musicBtn.onclick=()=>{

if(!playing){

music.play();

musicBtn.innerHTML="🔊";

playing=true;

}else{

music.pause();

musicBtn.innerHTML="🎵";

playing=false;

}

};

}

/*=====================================
        SCRATCH CARD
=====================================*/

const cover=document.querySelector(".cover");

if(cover){

cover.addEventListener("click",()=>{

cover.style.opacity="0";

cover.style.pointerEvents="none";

});

}

/*=====================================
    SCROLL ANIMATION
=====================================*/

const observer=new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("show");

}

});

},{threshold:.2});

document.querySelectorAll(

".story-card,.event-card,.gallery-grid img,.quote,.rsvp,.calendar,.thankyou"

).forEach(el=>{

el.classList.add("hidden");

observer.observe(el);

});
/*=====================================
        GALLERY LIGHTBOX
=====================================*/

const images = document.querySelectorAll(".gallery-grid img");

const lightbox = document.createElement("div");

lightbox.id = "lightbox";

lightbox.innerHTML = "<img>";

document.body.appendChild(lightbox);

const lightboxImg = lightbox.querySelector("img");

images.forEach(img => {

img.addEventListener("click", () => {

lightbox.classList.add("active");

lightboxImg.src = img.src;

});

});

lightbox.addEventListener("click", () => {

lightbox.classList.remove("active");

});

/*=====================================
        RSVP
=====================================*/

const form = document.querySelector(".rsvp-form");

if(form){

form.addEventListener("submit",function(e){

e.preventDefault();

alert("❤️ Thank you for your response.\n\nMay Allah bless you.");

createConfetti();

form.reset();

});

}

/*=====================================
      AUTO MUSIC
=====================================*/

document.body.addEventListener("click",()=>{

if(!playing){

music.play();

playing=true;

musicBtn.innerHTML="🔊";

}

},{once:true});

/*=====================================
    SCROLL TO TOP
=====================================*/

const topBtn=document.createElement("button");

topBtn.innerHTML="↑";

topBtn.id="topBtn";

document.body.appendChild(topBtn);

window.addEventListener("scroll",()=>{

if(window.scrollY>500){

topBtn.style.display="block";

}else{

topBtn.style.display="none";

}

});

topBtn.onclick=()=>{

window.scrollTo({

top:0,

behavior:"smooth"

});

};
