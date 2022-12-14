let searchBtn = document.querySelector(".searchBtn");
let closeBtn = document.querySelector(".closeBtn");
let searchBox = document.querySelector(".searchBox");
let navigation = document.querySelector(".navigation");
let menuToggle = document.querySelector(".menuToggle");
let header = document.querySelector("header");

menuToggle.onclick = function () {
  header.classList.toggle("open");
  searchBox.classList.remove("active");
  closeBtn.classList.remove("active");
  searchBtn.classList.remove("active");
};
