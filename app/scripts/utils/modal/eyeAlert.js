/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

define(function () {
	angular.module('eyeosModal', ['ui.bootstrap.modal'])
		.directive('eyeAlert', ['$modal', '$document', function ($modal, $document) {
			return {
				restrict: 'E',
				scope: {
					title: '@title',
					msg: '@msg',
					icon: '@icon',
					yes: '&'
				},
				link: function ($scope) {
					// Please note that $modalInstance represents a modal window (instance) dependency.
					// It is not the same as the $modal service used above.
					var ModalInstanceCtrl = ['$scope', '$modalInstance', 'alertData', function ($scope, $modalInstance, alertData) {
						$scope.title = alertData.title;
						$scope.msg = alertData.msg;
						$scope.icon = alertData.icon;

						$scope.ok = function () {
							$modalInstance.close();
						};

						function onKeydown(evt) {
							if (evt.which === 13) { // enter key
								evt.preventDefault();
								$scope.ok();
							}
						}

						$document.on('keydown', onKeydown);
						$scope.$on('$destroy', function () {
							$document.off('keydown', onKeydown);
						});
					}];

					$scope.open = function (size) {
						var modalInstance = $modal.open({
							templateUrl: 'themes/desktop/templates/utils/modal/eyeosAlert.tpl.html',
							controller: ModalInstanceCtrl,
							backdrop: 'static',
							size: size,
							resolve: {
								alertData: function () {
									return {
										title: $scope.title,
										msg: $scope.msg,
										icon: $scope.icon,
										yes: $scope.yes
									}
								}
							}
						});

						modalInstance.result.then(function () {
							$scope.yes();
						}, function () {
							$scope.yes();
						});
					};

					$scope.open();
				}
			}
		}]);
});
