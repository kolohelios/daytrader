'use strict';

angular.module('daytrader', ['firebase'])
.run(['$rootScope', '$window', function($rootScope, $window){
  $rootScope.sectorKeys = [];
  $rootScope.fbRoot = new $window.Firebase('https://daytrader-kolohelios.firebaseio.com/');
}])
.controller('master', ['$scope', '$firebaseObject', '$firebaseArray', '$http', function($scope, $firebaseObject, $firebaseArray, $http){

  var fbUser = $scope.fbRoot.child('user');
  var fbSectors = $scope.fbRoot.child('sectors');
  var afUser = $firebaseObject(fbUser);
  var afSectors = $firebaseArray(fbSectors);

  $scope.user = afUser;
  $scope.sectors = afSectors;

  function getStockQuote(symbol){
    $http.jsonp('http://dev.markitondemand.com/Api/v2/Quote/jsonp?symbol=' + symbol + '&callback=JSON_CALLBACK').then(function(response){
      return response.data.LastPrice;
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
    console.log('in buy stock function');
    var rec = afSectors.$getRecord($scope.sectorToAddTo);
    var testArray = fbSectors.child(rec.$id);
    var afTestArray = $firebaseArray(testArray);
    $scope.user.userBalance -= $scope.stock.position;
    afUser.$save($scope.user);
    rec.sectorTotal += $scope.stock.position * 1;
    afSectors.$save(rec);
    afTestArray.$add($scope.stock);
    $scope.stock = {};
  }

  function sectorTotal(sector){
    $scope.sectors
  }

  $scope.removeStock = function(sector, stock){
      // $http.jsonp('http://dev.markitondemand.com/Api/v2/Quote/jsonp?symbol=' + stock.name.toUpperCase() + '&callback=JSON_CALLBACK').then(function(response){
      //   sellStock(sector, stock, response.data.LastPrice);
      // });
  };

  function sellStock(sector, stock, quote){
    // console.log(sector, stock, quote)
    // var sellPrice = quote * stock.quantity;
    // // var rec = afSectors.$getRecord($scope.sectorToAddTo);
    // console.log(sector.$id);
    // var testArray = fbSectors.child(sector.$id);
    // var afTestArray = $firebaseArray(testArray);
    // $scope.user.userBalance += sellPrice;
    // sector.stock = null;
    // afSectors.$save(sector);
    // afUser.$save($scope.user);
    // //afTestArray.$remove(stock);
    // afSectors.$remove(stock);
    // //$scope.sector.splice(stock.$index, 1);
    // debugger;
  }

}]);
