angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    
  

      .state('elisera.home', {
    url: '/home',
    views: {
      'side-menu21': {
        templateUrl: 'templates/home.html',
        controller: 'homeCtrl'
      }
    }
  })

  .state('elisera.points', {
    url: '/points',
    views: {
      'side-menu21': {
        templateUrl: 'templates/points.html',
        controller: 'pointsCtrl'
      }
    }
  })

  .state('elisera.aboutApp', {
    url: '/aboutApp',
    views: {
      'side-menu21': {
        templateUrl: 'templates/aboutApp.html',
        controller: 'aboutAppCtrl'
      }
    }
  })

  .state('elisera', {
    url: '/sideMenu',
    templateUrl: 'templates/elisera.html',
    abstract:true
  })

  .state('elisera.transactionHistory', {
    url: '/transactionHistory',
    views: {
      'side-menu21': {
        templateUrl: 'templates/transactionHistory.html',
        controller: 'transactionHistoryCtrl'
      }
    }
  })

  .state('elisera.reservationHistory', {
    url: '/reservationHistory',
    views: {
      'side-menu21': {
        templateUrl: 'templates/reservationHistory.html',
        controller: 'reservationHistoryCtrl'
      }
    }
  })

  .state('elisera.myRoom', {
    url: '/myRoom',
    views: {
      'side-menu21': {
        templateUrl: 'templates/myRoom.html',
        controller: 'myRoomCtrl'
      }
    }
  })

  .state('elisera.exchangeHistory', {
    url: '/exchangeHistory',
    views: {
      'side-menu21': {
        templateUrl: 'templates/exchangeHistory.html',
        controller: 'exchangeHistoryCtrl'
      }
    }
  })
  
  .state('elisera.purchaseRoom', {
    url: '/purchaseRoom',
    views: {
      'side-menu21': {
        templateUrl: 'templates/purchaseRoom.html',
        controller: 'purchaseRoomCtrl'
      }
    }
  })
  
  .state('elisera.emptyRooms', {
    url: '/emptyRooms',
    views: {
      'side-menu21': {
        templateUrl: 'templates/emptyRooms.html',
        controller: 'emptyRoomsCtrl'
      }
    }
  })
  
  .state('elisera.accountRegistration', {
    url: '/accountRegistration',
    views: {
      'side-menu21': {
        templateUrl: 'templates/accountRegistration.html',
        controller: 'accountRegistrationCtrl'
      }
    }
  })
  
$urlRouterProvider.otherwise('/sideMenu/home')

  

});