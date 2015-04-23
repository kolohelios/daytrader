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
  };

  $scope.createSector = function(){
    console.log($scope.sector.name);
    //$scope.sector.stocks = [];
    //$scope.sector.value = 0;
    fbSectors.child($scope.sector.name).push({
      stocks: 0
    });
    //afSectors.$add($scope.sector).then(function(){
      //$scope.selectedSector = $scope.sector;
      // add code to select new sector as option in dropdown
    //});
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
    console.log($scope.stock);
    fbSectors.child($scope.sector.name).push($scope.stock);
    //var record = afSectors.$getRecord($scope.stock.sector.$id);
    //console.log(record);
    //$add($scope.stock);

  }

}]);
