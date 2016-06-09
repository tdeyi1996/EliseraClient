var Elisera = angular.module('app.controllers', ['ngCordova']);

var UserWalletID = '';
var UserID = 0;
var UserName = '';
var ScannedRoomID = 0;

Elisera.controller('homeCtrl', function($scope, $ionicPlatform, $cordovaDevice, $cordovaBarcodeScanner, $http, $state, $ionicHistory) {
	// Tasks to perform whenever the My Room view is accessed
	$scope.$on('$ionicView.enter', function() {
		// Cordova Extensions
		$ionicPlatform.ready(function() {
			// Get Device Information
			UserWalletID = $cordovaDevice.getUUID();
			
			// Verify Wallet Address
			$http.get('http://elisera-tandeyi.rhcloud.com/VerifyWalletAddress.php?WalletAddr=' + UserWalletID).then(function (response) {
				if (response.data.records[0].Result != 'valid') {
					// if not wallet addr found, go to registration page
					$ionicHistory.nextViewOptions({
						disableBack: true
					});		
					$state.go('elisera.accountRegistration'); // navigate to accountRegistration.html
				}
			});
			
			// Get User Information
			$http.get('http://elisera-tandeyi.rhcloud.com/ViewCustomerDetails.php?WalletAddr=' + UserWalletID).then(function (response) {
				$scope.names = response.data.records;
				
				UserID = $scope.names[0].CustomerID;
				UserName = $scope.names[0].Name;
				
				$scope.UserWalletID = $scope.names[0].WalletAddr;
				$scope.UserName = $scope.names[0].Name;
				$scope.UserPicURL = $scope.names[0].PictureURL;
			});
			
			// Get Room ID
			$scope.ScanRoom = function() {
				// Verify if user owns any room
				$http.get('http://elisera-tandeyi.rhcloud.com/VerifyRoomOwnership.php?CustomerID=' + UserID).then(function (response) {
					if (response.data.records[0].CustomerIDResult == 'valid' && response.data.records[0].ReservationIDResult == 'invalid') { // owns a room
						alert('You already owned a room. Please checkout before purchasing a new room.');
					}
					else if (response.data.records[0].CustomerIDResult == 'valid' && response.data.records[0].ReservationIDResult == 'valid') { // reserved a room
						$cordovaBarcodeScanner.scan().then(function(barcodeData) {
							if (barcodeData.cancelled) {
								return;
							}
							ScannedRoomID = '0'; // re-initialize scanned result
							ScannedRoomID = barcodeData.text; 
							
							// Verify Room ID and Reserved Room ID is the same
							$http.get('http://elisera-tandeyi.rhcloud.com/VerifyReservedRoom.php?CustomerID=' + UserID).then(function (response) {
								if (response.data.records[0].Result == 'valid') {
									if (response.data.records[0].RoomID == ScannedRoomID) {
										 $scope.RoomDetails = [{ RoomID: response.data.records[0].RoomID },{ Cost: response.data.records[0].Cost }];
										$state.go('elisera.purchaseRoom'); // navigate to purchaseRoom.html
									}
									else {
										alert('You can only purchase the room you reserved.');
									}
								}
								else {
									alert('Your reservation might be expired. Please try again later.');
								}
							});
						}, function() { 
							alert('Unable to scan code. Please try again later.'); 
						});
					}
					else { // never own and never reserve
						$cordovaBarcodeScanner.scan().then(function(barcodeData) {
							if (barcodeData.cancelled) {
								return;
							}
							ScannedRoomID = '0'; // re-initialize scanned result
							ScannedRoomID = barcodeData.text; 
							
							// Verify Room ID and it's availability
							$http.get('http://elisera-tandeyi.rhcloud.com/VerifyRoomAvailability.php?RoomID=' + ScannedRoomID).then(function (response) {
								if (ScannedRoomID != '0') {
									if (response.data.records[0].Result == 'valid') {
										$state.go('elisera.purchaseRoom'); // navigate to purchaseRoom.html
									}
									else {
										alert('The room is currently unavailable.');
									}
								}
								else {
									alert('Invalid room.');
								}
							});
						}, function() { 
							alert('Unable to scan code. Please try again later.'); 
						});
					}
				});
			};
		});
		
		// Find empty rooms
		$scope.FindEmptyRooms = function() {
			// Verify if user owns any room
			$http.get('http://elisera-tandeyi.rhcloud.com/VerifyRoomOwnership.php?CustomerID=' + UserID).then(function (response) {
				if (response.data.records[0].CustomerIDResult == 'invalid' && response.data.records[0].ReservationIDResult == 'invalid') {
					$state.go('elisera.emptyRooms'); // navigate to emptyRooms.html
				}
				else {
					alert('Please checkout if you own a room otherwise wait 5 minutes and try again.');
				}
			});
		};
	});
});
   
Elisera.controller('pointsCtrl', function($scope) {
	$scope.NoFunctionality = function() {
		alert('This functionality has not been added yet.');
	};
});
   
Elisera.controller('aboutAppCtrl', function($scope) {

});
      
Elisera.controller('transactionHistoryCtrl', function($scope, $http) {
	$scope.HideTransactions = true;
	$scope.HideMessage = true;
	$http.get('http://elisera-tandeyi.rhcloud.com/ViewTransactionHistory.php?CustomerID=' + UserID).then(function (response) {
		$scope.TransactionHistory = response.data.records;
		if ($scope.TransactionHistory.length > 0) {
			 $scope.HideTransactions = false;
			 $scope.HideMessage = true;
		}
		else {
			$scope.HideTransactions = true;
			 $scope.HideMessage = false;
		}
	});
});
   
Elisera.controller('reservationHistoryCtrl', function($scope, $http) {
	$scope.HideReservations = true;
	$scope.HideMessage = true;
	$http.get('http://elisera-tandeyi.rhcloud.com/ViewReservationHistory.php?CustomerID=' + UserID).then(function (response) {
		$scope.ReservationHistory = response.data.records;
		if ($scope.ReservationHistory.length > 0) {
			 $scope.HideReservations = false;
			 $scope.HideMessage = true;
		}
		else {
			$scope.HideReservations = true;
			 $scope.HideMessage = false;
		}		
	});
});
   
Elisera.controller('myRoomCtrl', function($scope, $ionicPlatform, $cordovaBarcodeScanner, $http, $state, $ionicHistory, $ionicPopup) {
	// Tasks to perform whenever the My Room view is accessed
	$scope.$on('$ionicView.enter', function() {
		$scope.HideMyRoomElements = true;
		$scope.HideMessage = true;
		
		// Verify if user owns any room
		$http.get('http://elisera-tandeyi.rhcloud.com/VerifyRoomOwnership.php?CustomerID=' + UserID).then(function (response) {
			if (response.data.records[0].CustomerIDResult == 'valid' && response.data.records[0].ReservationIDResult == 'invalid') {
				$scope.HideMyRoomElements = false;
				$scope.HideMessage = true;
			}
			else {
				$scope.HideMyRoomElements = true;
				$scope.HideMessage = false;
			}
		});
			
		// Get My Room Information
		$http.get('http://elisera-tandeyi.rhcloud.com/ViewMyRoomDetails.php?CustomerID=' + UserID).then(function (response) {
			$scope.MyRoomDetails = response.data.records;
		});
	});
	
	// Cordova Extensions
	$ionicPlatform.ready(function() {
		$scope.ScanRoom = function() {
			$cordovaBarcodeScanner.scan().then(function(barcodeData) {
				if (barcodeData.cancelled) {
					return;
				}
				ScannedRoomID = '0'; // re-initialize scanned result
				ScannedRoomID = barcodeData.text; 

				if (ScannedRoomID == $scope.MyRoomDetails[0].RoomID) {
					alert('Room key matched. The door is unlocked.');
					$ionicHistory.nextViewOptions({
						disableBack: true
					});
					$state.go('elisera.home'); // navigate to home.html
				}
				else {
					alert('Room key did not matched. The door will remain locked.');
				}
			}, function() { 
				alert('Unable to scan code. Please try again later.'); 
			});
		};
	});
	
	// Checkout
	$scope.Checkout = function() {
		var confirmCheckoutPopup = $ionicPopup.confirm({
			title: 'Checkout',
			template: 'Are you sure you want to checkout?'
		});
		confirmCheckoutPopup.then(function(popupResponse) {
			if(popupResponse) {
				$http.get('http://elisera-tandeyi.rhcloud.com/Checkout.php?RoomID=' + $scope.MyRoomDetails[0].RoomID + '&CustomerID=' + UserID).then(function (response) {
					if (response.data.records[0].UpdateRoomCheckoutResult == 'valid') {
						alert('Successfully checked out.');
						$ionicHistory.nextViewOptions({
							disableBack: true
						});
						$state.go('elisera.home'); // navigate to home.html
					}
					else {
						alert('Unable to checkout of the room. Please contact the hotel customer service for more information.');
					}
				});
			}
		});
	};
	
	// Display no functionality
	$scope.NoFunctionality = function() {
		alert('This functionality has not been added yet.');
	};
});
   
Elisera.controller('exchangeHistoryCtrl', function($scope) {

});
   
Elisera.controller('purchaseRoomCtrl', function($scope, $http) {
	$scope.UserName = UserName;
	$http.get('http://elisera-tandeyi.rhcloud.com/ViewRoomDetails.php?RoomID=' + ScannedRoomID).then(function (response) {
		$scope.RoomDetails = response.data.records;
	});
	
	// Confirm Purchase
	$scope.ConfirmPurchase = function() {
        // Date Format
		Date.prototype.yyyymmdd = function() {
			var yyyy = this.getFullYear().toString();
			var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
			var dd  = this.getDate().toString();
			return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]); // padding
		};

		// Start of purchase
		var stayDuration = $scope.data.PurchaseDays;
		var startDateObj = new Date();
		var endDateObj = new Date();
		endDateObj.setDate(endDateObj.getDate() + stayDuration);
		var startDate = startDateObj.yyyymmdd();
		var endDate = endDateObj.yyyymmdd();

		$http.get('http://elisera-tandeyi.rhcloud.com/PurchaseRoom.php?StayDuration=' + stayDuration + '&RoomID=' + ScannedRoomID + '&CustomerID=' + UserID + '&StartDate=' + startDate + '&EndDate=' + endDate).then(function(response) {
			if (response.data.records[0].InsertPurchaseResult == 'valid' && response.data.records[0].UpdateRoomInfoResult == 'valid') {
				alert('Purchase Successful.');
			}
			else {
				alert('Purchase Unsuccessful.');
			}
		});
    };
});

Elisera.controller('emptyRoomsCtrl', function($scope, $ionicPopup, $http, $ionicHistory, $state) {
	$scope.HideEmptyRooms = true;
	$scope.HideMessage = true;
	$http.get('http://elisera-tandeyi.rhcloud.com/ViewEmptyRooms.php').then(function (response) {
		$scope.EmptyRooms = response.data.records;
		if ($scope.EmptyRooms.length > 0) {
			 $scope.HideEmptyRooms = false;
			 $scope.HideMessage = true;
		}
		else {
			$scope.HideEmptyRooms = true;
			 $scope.HideMessage = false;
		}		
	});
	
	$scope.ReserveRoom = function(RoomID) {
		var confirmReservePopup = $ionicPopup.confirm({
			title: 'Reservation',
			template: 'Are you sure you want to reserve this room?'
		});
		confirmReservePopup.then(function(popupResponse) {
			if(popupResponse) {
				$http.get('http://elisera-tandeyi.rhcloud.com/ReserveRoom.php?RoomID=' + RoomID + '&CustomerID=' + UserID).then(function (response) {
					if (response.data.records[0].InsertReserveResult == 'valid' && response.data.records[0].UpdateReserveResult == 'valid') {
						alert('Successfully reserved room.');
						$ionicHistory.nextViewOptions({
							disableBack: true
						});
						$state.go('elisera.home'); // navigate to home.html
					}
					else {
						alert('Unable to reserve the room. Please contact the hotel customer service for more information.');
					}
				});
			}
		});	
	};
});

Elisera.controller('accountRegistrationCtrl', function($scope, $http, $ionicSideMenuDelegate, $ionicHistory, $state) {
	$ionicSideMenuDelegate.canDragContent(false);
	$scope.UserWalletID = UserWalletID;
	
	$scope.RegisterAccount = function() {
		$http.get('http://elisera-tandeyi.rhcloud.com/RegisterAccount.php?WalletAddr=' + UserWalletID + '&FullName=' + $scope.FullName + '&Email=' + $scope.Email + '&MobileNo=' + $scope.MobileNo + '&PictureURL=' + $scope.PictureURL).then(function (response) {
			if (response.data.records[0].InsertAccountResult == 'valid') {
				alert('Registered successfully.');
				$ionicHistory.nextViewOptions({
					disableBack: true
				});
				$state.go('elisera.home'); // navigate to home.html
			}
			else {
				alert('Unable to register. Please try again.');
			}
		});
	}
});