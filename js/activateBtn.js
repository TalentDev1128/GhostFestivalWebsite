const activateNavBtn = (id) => {
  document
    .getElementById("pills-mint-tab")
    .classList.remove("nav-button-active");
  document
    .getElementById("pills-collection-tab")
    .classList.remove("nav-button-active");
  document
    .getElementById("pills-upgrade-tab")
    .classList.remove("nav-button-active");
  document
    .getElementById("pills-fuse-tab")
    .classList.remove("nav-button-active");
  document
    .getElementById("pills-rent-tab")
    .classList.remove("nav-button-active");

  document
    .getElementById("pills-mint-tab")
    .classList.add("nav-button-inactive");
  document
    .getElementById("pills-collection-tab")
    .classList.add("nav-button-inactive");
  document
    .getElementById("pills-upgrade-tab")
    .classList.add("nav-button-inactive");
  document
    .getElementById("pills-fuse-tab")
    .classList.add("nav-button-inactive");
  document
    .getElementById("pills-rent-tab")
    .classList.add("nav-button-inactive");

  document.getElementById(id).classList.remove("nav-button-active");
  document.getElementById(id).classList.remove("nav-button-inactive");
  document.getElementById(id).classList.add("nav-button-active");
};
