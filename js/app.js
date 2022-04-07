const app = angular.module("myApp", []);
const commonCratePrice = 15;
const rareCratePrice = 45;
const epicCratePrice = 250;
const gfescrow_address = "S3dF4m16sCVvVAJySmffzUVNimmKspyQwZcW8HNYvEkdmKG";

const ghostFestivalSymbol = "GFNFT";
const gfescrowSymbol = "gfescrow";
const apiUrl = "http://localhost:7078";
// const ghostFestivalSymbol = "GNFT";
// const apiUrl = "http://testnet.phantasma.io:7078";
// const apiUrl = "http://207.148.17.86:7078";
// const apiUrl = "https://seed.ghostdevs.com:7078";
const linkToGFNFT = new PhantasmaLink(ghostFestivalSymbol);
let linkToGFESCROW = new PhantasmaLink(gfescrowSymbol);

app.controller("myCtrl", async function ($scope) {
  $scope.walletConnected = false;

  $scope.commonCrateCount = 0;
  $scope.rareCrateCount = 0;
  $scope.epicCrateCount = 0;

  $scope.totalCommonCratePrice = 0;
  $scope.totalRareCratePrice = 0;
  $scope.totalEpicCratePrice = 0;

  $scope.commonCurrentSupply = 0;
  $scope.rareCurrentSupply = 0;
  $scope.epicCurrentSupply = 0;

  $scope.boxRowsSplitted = [];
  $scope.ghostRowsSplitted = [];
  $scope.hammerRowsSplitted = [];
  $scope.badgeRowsSplitted = [];

  $scope.boxRows = [];
  $scope.ghostRows = [];
  $scope.hammerRows = [];
  $scope.badgeRows = [];

  $scope.selectedRentBadge = [];
  $scope.mySets = [];

  $scope.isUpgradeSourceGhost = undefined;
  $scope.isFuseSourceGhost = undefined;
  $scope.isFuseTargetGhost = undefined;

  const currentSupplies = await getCurretSupplies();

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
    linkToGFNFT.login(
      async function (success1) {
        linkToGFESCROW.login(
          async function (success2) {
            modal.style.display = "none";
            if (success1 && success2) {
              $scope.walletConnected = !$scope.walletConnected;
              const myAddress = linkToGFNFT.account.address;
              formatWalletAddress(myAddress);
              await $scope.fetchBalances(myAddress);
            } else {
              alert("Failed to connect Phantasma wallet");
            }
          },
          2,
          "phantasma",
          $providerHint
        );
      },
      2,
      "phantasma",
      $providerHint
    );
  };

  $scope.fetchBalances = async function (myAddress) {
    const boxRowsSplitted = await fetchBalance(myAddress, 1, true);
    const ghostRowsSplitted = await fetchBalance(myAddress, 2, true);
    const hammerRowsSplitted = await fetchBalance(myAddress, 3, true);
    const badgeRowsSplitted = await fetchBalance(myAddress, 4, true);

    const boxRows = await fetchBalance(myAddress, 1, false);
    const ghostRows = await fetchBalance(myAddress, 2, false);
    const hammerRows = await fetchBalance(myAddress, 3, false);
    const badgeRows = await fetchBalance(myAddress, 4, false);

    $scope.boxRowsSplitted = boxRowsSplitted;
    $scope.ghostRowsSplitted = ghostRowsSplitted;
    $scope.hammerRowsSplitted = hammerRowsSplitted;
    $scope.badgeRowsSplitted = badgeRowsSplitted;

    $scope.boxRows = boxRows;
    $scope.ghostRows = ghostRows;
    $scope.hammerRows = hammerRows;
    $scope.badgeRows = badgeRows;

    $scope.selectedCrateTokenIds = [];

    await $scope.getMySet();

    $scope.$apply();
  };

  $scope.onCrateSelected = function (boxTokenId) {
    // if selectedCrateTokenIds contains boxTokenId, add it, otherwise, remove it
    if ($scope.selectedCrateTokenIds.indexOf(boxTokenId) == -1)
      // not containing
      $scope.selectedCrateTokenIds.push(boxTokenId);
    // already containing
    else
      $scope.selectedCrateTokenIds = $scope.selectedCrateTokenIds.filter(
        function (e) {
          return e !== boxTokenId;
        }
      );
  };

  $scope.purchaseBox = function () {
    const commonMintNumber = parseInt(
      document.getElementById("commonMintNumber").innerText
    );
    const rareMintNumber = parseInt(
      document.getElementById("rareMintNumber").innerText
    );
    const epicMintNumber = parseInt(
      document.getElementById("epicMintNumber").innerText
    );

    if (!linkToGFNFT.account) {
      alert("Please connect your wallet first");
      return;
    }
    const myAddress = linkToGFNFT.account.address; //public addr of dummy wallet genesis, guid

    let gasPrice = 100000;
    let gaslimit = 9999;

    const numOfCrates = commonMintNumber + rareMintNumber + epicMintNumber;

    if (numOfCrates > 1) {
      gaslimit = 100000;
    }
    if (numOfCrates > 15) {
      gaslimit = 200000;
    }

    if (numOfCrates == 0) {
      alert("Please choose at least one crate");
      return;
    }

    if (commonMintNumber > 10 || rareMintNumber > 10 || epicMintNumber > 10) {
      alert("You can mint up to 10 crates at a time");
      return;
    }

    const sb = new ScriptBuilder();
    let script = sb.callContract("gas", "AllowGas", [
      myAddress,
      sb.nullAddress(),
      gasPrice,
      gaslimit,
    ]);

    for (let i = 0; i < commonMintNumber; i++) {
      script = script.callContract(ghostFestivalSymbol, "mint", [myAddress, 1]);
    }

    for (let i = 0; i < rareMintNumber; i++) {
      script = script.callContract(ghostFestivalSymbol, "mint", [myAddress, 2]);
    }

    for (let i = 0; i < epicMintNumber; i++) {
      script = script.callContract(ghostFestivalSymbol, "mint", [myAddress, 3]);
    }

    script = script.callContract("gas", "SpendGas", [myAddress]).endScript();

    linkToGFNFT.sendTransaction(
      "main",
      script,
      "festival1.0",
      async function (result) {
        if (!result.success) {
          alert(
            "Failed to mint " +
              (commonMintNumber + rareMintNumber + epicMintNumber) +
              " Crate(s)"
          );
        } else {
          alert(
            "Successfully minted " +
              (commonMintNumber + rareMintNumber + epicMintNumber) +
              " Crate(s)"
          );
          await $scope.fetchBalances(myAddress);
        }
      }
    );
  };

  $scope.upgradeNFT = async function () {
    if (!linkToGFNFT.account) {
      console.log("Connect your wallet to GFNFT App first");
      alert("Connect your wallet to GFNFT App first");
      return;
    }
    const myAddress = linkToGFNFT.account.address;

    // const { currentTcktBurnAmount, currentTcktBurnPower } =
    //   await calcTCKTBurnAmount();
    const currentTcktBurnAmount = 1000;
    const currentTcktBurnPower = 18;

    const hammerorghost = $scope.selectedForUpgrade;
    if (!hammerorghost) {
      alert("Please choose the source NFT to be upgraded.");
      return;
    }
    let type = !$scope.isUpgradeSourceGhost;

    const nftObj = await ramByID(myAddress, hammerorghost.tokenID);
    const level = parseInt(nftObj.level) + 1;
    console.log(nftObj.level, nftObj.name, nftObj.description);

    const gasPrice = 100000;
    const gaslimit = 10000;

    const sb = new ScriptBuilder();
    const script = sb
      .callContract("gas", "AllowGas", [
        myAddress,
        sb.nullAddress(),
        gasPrice,
        gaslimit,
      ])
      .callContract(ghostFestivalSymbol, "upgradeNFT", [
        type,
        myAddress,
        hammerorghost.tokenID,
        currentTcktBurnAmount,
        currentTcktBurnPower,
        nftObj.name,
        nftObj.description,
        nftObj.imageURL,
        nftObj.infoURL,
        nftObj.rarity,
        nftObj.model,
        type === 1 ? nftObj.hammerType : nftObj.ghostType,
        level,
        nftObj.infusedType1,
        nftObj.infusedType2,
        type === 2 ? true : true,
      ])
      .callContract("gas", "SpendGas", [myAddress])
      .endScript();

    linkToGFNFT.sendTransaction(
      "main",
      script,
      "festival1.0",
      async function (result) {
        console.log("========", result);
        if (!result || !result.success)
          alert("Failed to upgrade " + (type === 1 ? "Hammer" : "Ghost"));
        else {
          await $scope.fetchBalances(myAddress);
          alert("successfully upgraded " + (type === 1 ? "Hammer" : "Ghost"));
        }
      }
    );
  };

  $scope.fuseNFT = async function () {
    if (!linkToGFNFT.account) {
      alert("Connect your wallet to GFNFT App first");
      return;
    }
    const myAddress = linkToGFNFT.account.address;

    // const { currentTcktBurnAmount, currentTcktBurnPower } =
    //   await calcTCKTBurnAmount();
    const currentTcktBurnAmount = 1000;
    const currentTcktBurnPower = 18;

    const source = $scope.selectedFuseSource;
    const target = $scope.selectedFuseTarget;
    if (!source || !target) {
      alert("Please choose the source and target NFTs first.");
      return;
    }

    if (source.tokenID == target.tokenID) {
      alert("The source and target NFTs cannot be the same one.");
      return;
    }
    let type = !$scope.isFuseSourceGhost;

    const sourceNFTObj = await ramByID(myAddress, source.tokenID);
    const targetNFTObj = await ramByID(myAddress, target.tokenID);
    console.log(source.tokenID, sourceNFTObj.name);
    console.log(target.tokenID, targetNFTObj.name);

    let infusedType1 = targetNFTObj.infusedType1;
    let infusedType2 = targetNFTObj.infusedType2;
    // check if the target is already filled all in InfusedType1 and InfusedType2
    if (infusedType1 !== "None" && infusedType2 !== "None") {
      alert(
        "The target nft is already filled for infusion, no more infusion allowed"
      );
      return;
    }

    if (infusedType1 === "None") {
      infusedType1 =
        type === 1 ? sourceNFTObj.hammerType : sourceNFTObj.ghostType;
      infusedType2 = "None";
    } else if (infusedType2 === "None") {
      infusedType1 =
        type === 1 ? targetNFTObj.hammerType : targetNFTObj.ghostType;
      infusedType2 =
        type === 1 ? sourceNFTObj.hammerType : sourceNFTObj.ghostType;
    }

    const gasPrice = 100000;
    const gaslimit = 10000;

    const sb = new ScriptBuilder();
    const script = sb
      .callContract("gas", "AllowGas", [
        myAddress,
        sb.nullAddress(),
        gasPrice,
        gaslimit,
      ])
      .callContract(ghostFestivalSymbol, "fuseNFT", [
        type,
        myAddress,
        target.tokenID,
        source.tokenID,
        currentTcktBurnAmount,
        currentTcktBurnPower,
        targetNFTObj.name,
        targetNFTObj.description,
        targetNFTObj.imageURL,
        targetNFTObj.infoURL,
        targetNFTObj.rarity,
        targetNFTObj.model,
        type === 1 ? targetNFTObj.hammerType : targetNFTObj.ghostType,
        targetNFTObj.level,
        infusedType1,
        infusedType2,
        true,
      ])
      .callContract("gas", "SpendGas", [myAddress])
      .endScript();

    linkToGFNFT.sendTransaction(
      "main",
      script,
      "festival1.0",
      async function (result) {
        console.log("========", result);
        if (!result || !result.success)
          alert("Failed to fuse " + (type === 1 ? "Hammer" : "Ghost"));
        else {
          await $scope.fetchBalances(myAddress);
          alert("successfully fused " + (type === 1 ? "Hammer" : "Ghost"));
        }
      }
    );
  };

  // let script = sb.callContract("gas", "AllowGas", [
  //   myAddress,
  //   sb.nullAddress(),
  //   gasPrice,
  //   gaslimit,
  // ]);

  // for (let i = 0; i < commonMintNumber; i++) {
  //   script = script.callContract(ghostFestivalSymbol, "mint", [myAddress, 1]);
  // }

  // for (let i = 0; i < rareMintNumber; i++) {
  //   script = script.callContract(ghostFestivalSymbol, "mint", [myAddress, 2]);
  // }

  // for (let i = 0; i < epicMintNumber; i++) {
  //   script = script.callContract(ghostFestivalSymbol, "mint", [myAddress, 3]);
  // }

  // script = script.callContract("gas", "SpendGas", [myAddress]).endScript();

  $scope.burnOnWebsite = function ($boxNFTID) {
    if (!linkToGFNFT.account) {
      alert("Please connect your wallet first");
      return;
    }
    const myAddress = linkToGFNFT.account.address;
    const boxNFTID = $boxNFTID.substring(5);

    let gasPrice = 100000;
    let gaslimit = 10000;

    let sb = new ScriptBuilder();
    let script = sb.callContract("gas", "AllowGas", [
      myAddress,
      sb.nullAddress(),
      gasPrice,
      gaslimit,
    ]);

    if ($scope.selectedCrateTokenIds.indexOf(boxNFTID) == -1)
      script = script.callContract(ghostFestivalSymbol, "burnOnWebsite", [
        myAddress,
        ghostFestivalSymbol,
        boxNFTID,
      ]);
    else {
      for (let i = 0; i < $scope.selectedCrateTokenIds.length; i++)
        script = script.callContract(ghostFestivalSymbol, "burnOnWebsite", [
          myAddress,
          ghostFestivalSymbol,
          $scope.selectedCrateTokenIds[i],
        ]);
    }

    script = script.callContract("gas", "SpendGas", [myAddress]).endScript();

    linkToGFNFT.sendTransaction(
      "main",
      script,
      "festival1.0",
      async function (result) {
        console.log("========", result);
        if (!result.success) {
          alert("Failed to burn");
        } else {
          alert("Successfully burned. See the NFTs on Ghost Market");
          await $scope.fetchBalances(myAddress);
        }
      }
    );
  };

  $scope.createSet = function () {
    if (!linkToGFNFT.account) {
      alert("Please connect your wallet first");
      return;
    }
    const myAddress = linkToGFESCROW.account.address;
    const hammer = $scope.selectedRentHammer;
    const ghost = $scope.selectedRentGhost;
    const badge1 = $scope.selectedRentBadge[0];
    const badge2 = $scope.selectedRentBadge[1];
    const badge3 = $scope.selectedRentBadge[2];
    const badge4 = $scope.selectedRentBadge[3];
    const badge5 = $scope.selectedRentBadge[4];
    const badge6 = $scope.selectedRentBadge[5];

    const isValidEmpty = validateEmpty(
      hammer,
      ghost,
      badge1,
      badge2,
      badge3,
      badge4,
      badge5,
      badge6
    );

    if (!isValidEmpty) {
      alert("Some of your token IDs are empty");
      return;
    }

    const gasPrice = 100000;
    const gaslimit = 10000;

    const sb = new ScriptBuilder();
    const script = sb
      .callContract("gas", "AllowGas", [
        myAddress,
        sb.nullAddress(),
        gasPrice,
        gaslimit,
      ])
      .callContract(gfescrowSymbol, "listSet", [
        myAddress,
        2,
        hammer.tokenID,
        ghost.tokenID,
        badge1.tokenID,
        badge2.tokenID,
        badge3.tokenID,
        badge4.tokenID,
        badge5.tokenID,
        badge6.tokenID,
      ])
      .callContract("gas", "SpendGas", [myAddress])
      .endScript();

    linkToGFESCROW.sendTransaction(
      "main",
      script,
      "festival1.0",
      async function (result) {
        console.log("========", result);
        if (!result || !result.success) alert("Failed to create a list");
        else {
          alert("successfully listed your set");
          await $scope.fetchBalances(myAddress);
        }
      }
    );
  };

  $scope.breakSet = function ($setID) {
    if (!linkToGFESCROW.account) {
      alert("Connect your wallet to GFESCROW App first");
      return;
    }

    if ($setID < 0) {
      alert("set ID can not be empty or zero");
      return;
    }

    const myAddress = linkToGFESCROW.account.address;

    const gasPrice = 100000;
    const gaslimit = 10000;

    const sb = new ScriptBuilder();
    const script = sb
      .callContract("gas", "AllowGas", [
        myAddress,
        sb.nullAddress(),
        gasPrice,
        gaslimit,
      ])
      .callContract(gfescrowSymbol, "deListSet", [myAddress, $setID])
      .callContract("gas", "SpendGas", [myAddress])
      .endScript();

    linkToGFESCROW.sendTransaction(
      "main",
      script,
      "festival1.0",
      async function (result) {
        console.log("========", result);
        if (!result || !result.success) alert("Failed to break your set");
        else {
          alert("successfully broke your set");
          await $scope.fetchBalances(myAddress);
        }
      }
    );
  };

  // type:
  // 1 for upgrade source
  // 2 for fuse source
  // 3 for fuse target
  // 4 for rentout ghost
  // 5 for rentout hammer
  // 6 ~ 11 rentout badge

  // isGhost;
  // true for Ghost; default
  // false for Hammer
  $scope.setSelected = function ($selectedNFT, $type, $isGhost) {
    console.log("===", $isGhost);
    if ($type == 1) {
      $scope.isUpgradeSourceGhost = $isGhost;
      $scope.selectedForUpgrade = $selectedNFT;
    } else if ($type == 2) {
      if ($scope.isFuseTargetGhost == undefined)
        $scope.isFuseSourceGhost = $isGhost;
      else if ($scope.isFuseTargetGhost != $isGhost) {
        alert(
          "The source and the target NFTs should be both Ghosts or both Hammers."
        );
        return;
      }
      $scope.isFuseSourceGhost = $isGhost;
      $scope.selectedFuseSource = $selectedNFT;
    } else if ($type == 3) {
      if ($scope.isFuseSourceGhost == undefined)
        $scope.isFuseTargetGhost = $isGhost;
      else if ($scope.isFuseSourceGhost != $isGhost) {
        alert(
          "The source and the target NFTs should be both Ghosts or both Hammers."
        );
        return;
      }
      $scope.isFuseTargetGhost = $isGhost;
      $scope.selectedFuseTarget = $selectedNFT;
    } else if ($type == 4) $scope.selectedRentGhost = $selectedNFT;
    else if ($type == 5) $scope.selectedRentHammer = $selectedNFT;
    // do not allow duplicates for badges
    if ($type >= 6 && $type <= 11) {
      const duplicatePass = passedDuplicate(
        $scope.selectedRentBadge,
        $selectedNFT,
        $type - 6
      );
      if (!duplicatePass) {
        alert("This item is already selected");
        return;
      }
      $scope.selectedRentBadge[$type - 6] = $selectedNFT;
    }
  };

  $scope.getMySet = function () {
    if (!linkToGFESCROW.account) {
      console.log("Connect your wallet to GFESCROW App first");
      return;
    }

    let mySets = [];
    $scope.mySets = mySets;
    $scope.$apply();

    const myAddress = linkToGFESCROW.account.address;

    const sb1 = new ScriptBuilder();
    const script1 = sb1
      .callContract(gfescrowSymbol, "getCurrentLoanID", [])
      .endScript();
    linkToGFESCROW.invokeRawScript(
      "main",
      script1,
      "festival1.0",
      async function (response_current_id) {
        const currentLoanID = phantasmaJS.phantasmaJS.decodeVMObject(
          response_current_id.result
        );

        for (let i = 0; i < currentLoanID; i++) {
          const sb2 = new ScriptBuilder();
          const script2 = sb2
            .callContract(gfescrowSymbol, "checkStatusOfLender", [myAddress, i])
            .endScript();

          await linkToGFESCROW.invokeRawScript(
            "main",
            script2,
            "festival1.0",
            async function (response_current_loan) {
              const loanStatus = phantasmaJS.phantasmaJS.decodeVMObject(
                response_current_loan.result
              );
              const hammerRAM = await ramByID(
                gfescrow_address,
                loanStatus.hammerTokenID
              );
              const ghostRAM = await ramByID(
                gfescrow_address,
                loanStatus.ghostTokenID
              );
              const badgeRAM1 = await ramByID(
                gfescrow_address,
                loanStatus.badgeTokenID1
              );
              const badgeRAM2 = await ramByID(
                gfescrow_address,
                loanStatus.badgeTokenID2
              );
              const badgeRAM3 = await ramByID(
                gfescrow_address,
                loanStatus.badgeTokenID3
              );
              const badgeRAM4 = await ramByID(
                gfescrow_address,
                loanStatus.badgeTokenID4
              );
              const badgeRAM5 = await ramByID(
                gfescrow_address,
                loanStatus.badgeTokenID5
              );
              const badgeRAM6 = await ramByID(
                gfescrow_address,
                loanStatus.badgeTokenID6
              );

              if (loanStatus.loan_status == 0 || loanStatus.loan_status == 1)
                return;

              mySets.push({
                setID: i,
                hammerTokenID: loanStatus.hammerTokenID,
                hammerName: hammerRAM.name,
                hammerLevel: hammerRAM.level,
                ghostTokenID: loanStatus.ghostTokenID,
                ghostName: ghostRAM.name,
                ghostLevel: ghostRAM.level,
              });
              $scope.mySets = mySets;
              $scope.$apply();
            }
          );
        }
      }
    );
  };

  $scope.onChooseClicked = function () {
    if (!linkToGFNFT.account) {
      alert("Please connect your wallet first");
      return;
    }
  };
});

const ramByID = async (address, nftID) => {
  const nftObj = await $.getJSON(
    apiUrl +
      "/api/getNFTs?account=" +
      address +
      "&symbol=" +
      ghostFestivalSymbol +
      "&IDText=" +
      nftID
  );
  const ram = decodeVMObject(nftObj[0].ram);
  return ram;
};

const getCurretSupplies = async () => {
  const getTokenURL = apiUrl + "/api/getToken?symbol=" + ghostFestivalSymbol;
  let tokenJson;
  await fetch(getTokenURL)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
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
const fetchBalance = async (myAddress, type, shouldSplit) => {
  const res = await $.getJSON(apiUrl + "/api/getAccount?account=" + myAddress);
  if (!res) {
    alert("Cannot connect to the api server");
  } else if (res.error && res.error !== "pending") {
    alert("Cannot connect to the api server");
  } else {
    const balances = res.balances;
    let commonBoxes = [];
    let rareBoxes = [];
    let epicBoxes = [];

    let hammers = [];
    let ghosts = [];
    let badges = [];
    for (let i = 0; i < balances.length; i++) {
      if (balances[i].symbol == ghostFestivalSymbol) {
        nftIDs = balances[i].ids;
        for (let j = 0; j < nftIDs.length; j++) {
          let nthNft = httpGet(
            apiUrl +
              "/api/getNFTs?account=" +
              myAddress +
              "&symbol=" +
              ghostFestivalSymbol +
              "&IDText=" +
              nftIDs[j]
          );
          nthNft = JSON.parse(nthNft);
          const series = nthNft[0].series;
          const name = decodeVMObject(nthNft[0].ram).name;
          const imageURL = convertImageURL(
            decodeVMObject(nthNft[0].ram).imageURL
          );
          const level = decodeVMObject(nthNft[0].ram).level;
          const nftObj = {
            name: name,
            imageURL: imageURL,
            tokenID: nftIDs[j].toString(),
            level: level,
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

        let resultArr = [];
        if (type == 1) resultArr = totalBoxes;
        else if (type == 2) resultArr = ghosts;
        else if (type == 3) resultArr = hammers;
        else if (type == 4) resultArr = badges;

        if (shouldSplit) {
          splitted = chunkArrayInGroups(resultArr, 3);

          return splitted;
        } else {
          console.log(resultArr);
          return resultArr;
        }
      }
    }
  }
};

const convertImageURL = (imageURL) => {
  let converted = imageURL;
  if (imageURL.includes("ipfs://")) {
    converted = imageURL.split("//")[1].split("/")[1];
    converted = "../assets/" + converted;
  }
  return converted;
};
