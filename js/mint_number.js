const app = angular.module("angularMintApp", []);
const commonCratePrice = 15;
const rareCratePrice = 45;
const epicCratePrice = 250;

app.controller("mintCountCtrl", function ($scope) {
  $scope.commonCrateCount = 0;
  $scope.rareCrateCount = 0;
  $scope.epicCrateCount = 0;

  $scope.totalCommonCratePrice = 0;
  $scope.totalRareCratePrice = 0;
  $scope.totalEpicCratePrice = 0;

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
});
