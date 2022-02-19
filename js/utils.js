const httpGet = (theUrl) => {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", theUrl, false); // false for synchronous request
  xmlHttp.send(null);
  return xmlHttp.responseText;
};

const chunkArrayInGroups = (arr, size) => {
  var myArray = [];
  for (var i = 0; i < arr.length; i += size) {
    myArray.push(arr.slice(i, i + size));
  }
  return myArray;
};

const formatWalletAddress = (myAddress) => {
  document.getElementById("connectBtn").innerText =
    myAddress.substring(0, 5) + "..." + myAddress.substring(43);
};

function validateEmpty() {
  let isValid = true;

  for (let i = 0; i < arguments.length; i++) {
    if (!arguments[i]) {
      isValid = false;
      break;
    }
  }
  return isValid;
}

function validateDuplicate(myArray) {
  return myArray.length === new Set(myArray).size;
}

const passedDuplicate = (srcArr, selectedItem, index) => {
  console.log(srcArr, selectedItem, index);
  let passed = true;
  for (let i = 0; i < srcArr.length; i++) {
    if (i == index) continue;
    if (srcArr[i] == selectedItem) {
      passed = false;
      break;
    }
  }
  return passed;
};

// Get the modal
var modal = document.getElementById("walletModal");

// Get the button that opens the modal
var connectBtn = document.getElementById("connectBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
connectBtn.onclick = function () {
  modal.style.display = "block";
};

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  modal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};
