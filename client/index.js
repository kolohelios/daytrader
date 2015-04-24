'use strict';

angular.module('daytrader', ['firebase'])
.run(['$rootScope', '$window', function($rootScope, $window){
  $rootScope.sectorKeys = [];
  $rootScope.fbRoot = new $window.Firebase('https://daytrade.firebaseio.com/');
}])
.controller('master', ['$scope', '$firebaseObject', '$firebaseArray', '$http', function($scope, $firebaseObject, $firebaseArray, $http){

  var fbUser = $scope.fbRoot.child('user');
  var fbSectors = $scope.fbRoot.child('sectors');
  var afUser = $firebaseObject(fbUser);
  var afSectors = $firebaseArray(fbSectors);

  $scope.user = afUser;
  $scope.sectors = afSectors;

  // if (afUser){
  //   $scope.userFormHide = true;
  // }
  if (afSectors.length > 0){
    calculateSectorTotal();
  }

  function getStockQuote(symbol){
    $http.jsonp('http://dev.markitondemand.com/Api/v2/Quote/jsonp?symbol=' + symbol + '&callback=JSON_CALLBACK')
    .then(function(response){
      return response.data.LastPrice;
    })
    .catch(function(error){
      alert('An error occured while attempting to get the price for the specified ticker symbol!!  Please check your ticker for correctness and try again.');
      $scope.sector = {};
      return;
    });
  }
  getStockQuote('AAPL');

  $scope.saveUser = function(){
    afUser.$save($scope.user);
    $scope.userFormHide = true;
  };

  $scope.createSector = function(){
    console.log($scope.sector.name);
    $scope.sector.sectorTotal = 0;
    afSectors.$add($scope.sector);
    $scope.sector = {};
  };

  $scope.addStock = function(){
      $http.jsonp('http://dev.markitondemand.com/Api/v2/Quote/jsonp?symbol=' + $scope.stock.name.toUpperCase() + '&callback=JSON_CALLBACK').then(function(response){
        buyStock(response.data.LastPrice);
      });
  };
  function buyStock(quote){
    $scope.stock.position = (quote * $scope.stock.quantity).toFixed(2);
    if ($scope.stock.position > $scope.user.userBalance){
      alert("You don't have enough money for that purchase");
      return;
    }
    var rec = afSectors.$getRecord($scope.sectorToAddTo);
    var testArray = fbSectors.child(rec.$id);
    var afTestArray = $firebaseArray(testArray);
    $scope.user.userBalance -= $scope.stock.position;
    afUser.$save($scope.user);
    console.log('$scope.user: ', $scope.user);
    rec.sectorTotal += $scope.stock.position * 1;
    afSectors.$save(rec);
    afTestArray.$add($scope.stock);
    $scope.stock = {};
    // calculateSectorTotal();
  }

  $scope.removeStock = function(stock, key, sector){
    console.log(stock, key);
      $http.jsonp('http://dev.markitondemand.com/Api/v2/Quote/jsonp?symbol=' + stock.name.toUpperCase() + '&callback=JSON_CALLBACK').then(function(response){

        sellStock(stock, key, sector, response.data.LastPrice);
      });
  };

  function sellStock(stock, key, sector, quote){
    var sellPrice = quote * stock.quantity;
    var rec = afSectors.$getRecord(sector.$id);
    var testArray = fbSectors.child(rec.$id).child(key);
    var afTestObject = $firebaseObject(testArray);
    $scope.user.userBalance += sellPrice;
    afUser.$save($scope.user);
    rec.sectorTotal -= sellPrice * 1;
    afSectors.$save(rec);
    afTestObject.$remove();
    // calculateSectorTotal();
  }

  function calculateSectorTotal(){
    $scope.investmentTotal = 0;
    var rec;
    afSectors.forEach(function(folio){
      rec = afSectors.$getRecord(folio.$id);
      $scope.investmentTotal += rec.sectorTotal;
    });
  }
  $scope.calculateSectorTotal = calculateSectorTotal;

}]);
