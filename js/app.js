const app = angular.module("myApp", []);
const commonCratePrice = 15;
const rareCratePrice = 45;
const epicCratePrice = 250;

const NFTSymbol = "GFNFT";
const apiUrl = "http://localhost:7078";
// const NFTSymbol = "GNFT";
// const apiUrl = "http://testnet.phantasma.io:7078";
// const apiUrl = "http://207.148.17.86:7078";
// const apiUrl = "https://seed.ghostdevs.com:7078";
const link = new PhantasmaLink(NFTSymbol);

app.controller("myCtrl", async function ($scope) {
  $scope.commonCrateCount = 0;
  $scope.rareCrateCount = 0;
  $scope.epicCrateCount = 0;

  $scope.totalCommonCratePrice = 0;
  $scope.totalRareCratePrice = 0;
  $scope.totalEpicCratePrice = 0;

  $scope.commonCurrentSupply = 0;
  $scope.rareCurrentSupply = 0;
  $scope.epicCurrentSupply = 0;

  $scope.boxRows = [];
  $scope.ghostRows = [];
  $scope.hammerRows = [];
  $scope.badgeRows = [];

  const currentSupplies = await getCurretSupplies();
  console.log(currentSupplies);

  $scope.commonCurrentSupply = currentSupplies.series1;
  $scope.rareCurrentSupply = currentSupplies.series2;
  $scope.epicCurrentSupply = currentSupplies.series3;
  $scope.$apply();

  // $crateType : 1 for common, 2 for rare, and 3 for epic
  // $plus_minus : -1 for minus, 1 for plus
  $scope.controlMintCount = function ($crateType, $plus_minus) {
    if ($plus_minus == 1) {
      if ($crateType == 1) $scope.commonCrateCount++;
      else if ($crateType == 2) $scope.rareCrateCount++;
      else if ($crateType == 3) $scope.epicCrateCount++;
    }
    if ($plus_minus == -1) {
      if ($crateType == 1) $scope.commonCrateCount--;
      else if ($crateType == 2) $scope.rareCrateCount--;
      else if ($crateType == 3) $scope.epicCrateCount--;
    }

    $scope.limitMintCount();
    $scope.calcMintPrice();
  };

  $scope.limitMintCount = function () {
    if ($scope.commonCrateCount < 0) $scope.commonCrateCount = 0;
    if ($scope.rareCrateCount < 0) $scope.rareCrateCount = 0;
    if ($scope.epicCrateCount < 0) $scope.epicCrateCount = 0;

    if ($scope.commonCrateCount > 100) $scope.commonCrateCount = 100;
    if ($scope.rareCrateCount > 100) $scope.rareCrateCount = 100;
    if ($scope.epicCrateCount > 100) $scope.epicCrateCount = 100;
  };

  $scope.calcMintPrice = function () {
    $scope.totalCommonCratePrice = $scope.commonCrateCount * commonCratePrice;
    $scope.totalRareCratePrice = $scope.rareCrateCount * rareCratePrice;
    $scope.totalEpicCratePrice = $scope.epicCrateCount * epicCratePrice;
  };

  $scope.loginToPhantasma = function ($providerHint) {
    link.login(
      async function (success) {
        modal.style.display = "none";
        if (success) {
          console.log("Logged in");
          const myAddress = link.account.address;
          formatWalletAddress(myAddress);
          const boxRows = await fetchBalance(myAddress, 1);
          const ghostRows = await fetchBalance(myAddress, 2);
          const hammerRows = await fetchBalance(myAddress, 3);
          const badgeRows = await fetchBalance(myAddress, 4);

          console.log(boxRows);
          console.log(ghostRows);
          console.log(hammerRows);
          console.log(badgeRows);

          $scope.boxRows = boxRows;
          $scope.ghostRows = ghostRows;
          $scope.hammerRows = hammerRows;
          $scope.badgeRows = badgeRows;

          $scope.$apply();
        } else {
          alert("Failed to connect Phantasma wallet");
        }
      },
      2,
      "phantasma",
      $providerHint
    );
  };
});

const getCurretSupplies = async () => {
  const getTokenURL = apiUrl + "/api/getToken?symbol=" + NFTSymbol;
  let tokenJson;
  await fetch(getTokenURL)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      console.log("====", data);
      tokenJson = data;
    })
    .catch(function (err) {
      console.log(err, " error");
    });
  let currentSupplies = { series1: 0, series2: 0, series3: 0 };
  if (!tokenJson) return currentSupplies;
  const series = tokenJson.series;
  if (!series) return currentSupplies;
  for (let i = 0; i < series.length; i++) {
    const currentSeriesObj = series[i];
    if (currentSeriesObj.seriesID === 1)
      currentSupplies.series1 = currentSeriesObj.currentSupply;
    else if (currentSeriesObj.seriesID === 2)
      currentSupplies.series2 = currentSeriesObj.currentSupply;
    else if (currentSeriesObj.seriesID === 3)
      currentSupplies.series3 = currentSeriesObj.currentSupply;
  }
  return currentSupplies;
};

// type: 1 for crates, 2 for ghosts, 3 for hammers, 4 for badges
const fetchBalance = async (myAddress, type) => {
  const res = await $.getJSON(apiUrl + "/api/getAccount?account=" + myAddress);
  console.log(res);
  if (!res) {
    alert("Cannot connect to the api server");
    console.log("error 1");
  } else if (res.error && res.error !== "pending") {
    alert("Cannot connect to the api server");
    console.log("error 2");
  } else {
    const balances = res.balances;
    let commonBoxes = [];
    let rareBoxes = [];
    let epicBoxes = [];

    let hammers = [];
    let ghosts = [];
    let badges = [];
    for (let i = 0; i < balances.length; i++) {
      if (balances[i].symbol == NFTSymbol) {
        nftIDs = balances[i].ids;
        for (let j = 0; j < nftIDs.length; j++) {
          let nthNft = httpGet(
            apiUrl +
              "/api/getNFTs?account=" +
              myAddress +
              "&symbol=" +
              NFTSymbol +
              "&IDText=" +
              nftIDs[j]
          );
          nthNft = JSON.parse(nthNft);
          const series = nthNft[0].series;
          const nftName = decodeVMObject(nthNft[0].ram).name;
          console.log(type, series, nftName);
          const nftObj = {
            name: nftName,
            tokenID:
              nftIDs[j].toString().substr(0, 5) +
              "..." +
              nftIDs[j].toString().substr(73),
          };

          if (type == 1) {
            if (parseInt(series) == 1) commonBoxes.push(nftObj);
            else if (parseInt(series) == 2) rareBoxes.push(nftObj);
            else if (parseInt(series) == 3) epicBoxes.push(nftObj);
          } else if (type == 2) {
            if (parseInt(series) >= 51 && parseInt(series) <= 60)
              ghosts.push(nftObj);
          } else if (type == 3) {
            if (parseInt(series) >= 11 && parseInt(series) <= 42)
              hammers.push(nftObj);
          } else if (type == 4) {
            if (parseInt(series) >= 5 && parseInt(series) <= 7)
              badges.push(nftObj);
          }
        }

        const totalBoxes = commonBoxes.concat(rareBoxes).concat(epicBoxes);
        let splitted = [];

        console.log(totalBoxes);
        console.log(ghosts);
        console.log(hammers);
        console.log(badges);

        if (type == 1) splitted = chunkArrayInGroups(totalBoxes, 3);
        else if (type == 2) splitted = chunkArrayInGroups(ghosts, 3);
        else if (type == 3) splitted = chunkArrayInGroups(hammers, 3);
        else if (type == 4) splitted = chunkArrayInGroups(badges, 3);
        console.log(splitted);
        return splitted;
      }
    }
  }
};
