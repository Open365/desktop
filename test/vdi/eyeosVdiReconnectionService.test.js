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

'use strict';

define([
    'vdi/eyeosVdiReconnectionService'
], function (EyeosVdiReconnectionService) {
    suite("eyeosVdiReconnectionService", function () {
        var sut, clock, settings, auxBus, desktopBus;

        setup(function () {
            auxBus = window.DesktopBus;
            desktopBus = new window.FakeDesktopBus();

            sinon.stub(eyeosVdiClient, "cancelFreeze");
            sinon.stub(eyeosVdiClient, "getReconnecting");
            sinon.stub(eyeosVdiClient, "setReconnecting");
            sinon.stub(eyeosVdiClient, "reconnect");

            settings = {
                VDI_RECONNECTION_FREEZE_TIME: 2000,
                VDI_RECONNECTION_CANCEL_TIME: 10000,
                VDI_RECONNECTION_RETRY_TIME: 1000,
                VDI_RECONNECTION_FREEZE: true
            };

            clock = sinon.useFakeTimers();

            sut = new EyeosVdiReconnectionService(settings, desktopBus);
            sut.setVdiClient(eyeosVdiClient);

            sinon.stub(sut, 'dispose');
        });

        teardown(function () {
            eyeosVdiClient.cancelFreeze.restore();
            eyeosVdiClient.getReconnecting.restore();
            eyeosVdiClient.setReconnecting.restore();
            eyeosVdiClient.reconnect.restore();
            window.DesktopBus = auxBus;
            clock.restore();
        });

        suite("#connectErrorSubscription", function () {
            test("adds the subscription to the list of subscriptions", function () {
                sut.connectErrorSubscription();
                assert.equal(sut.subscriptions.length, 1);
            });

            suite("on wm.connect.error", function () {
                function exerciseFreeze () {
                    sut.connectErrorSubscription();
                    desktopBus.dispatch("wm.connect.error", {});
                    clock.tick(settings.VDI_RECONNECTION_FREEZE_TIME);
                }

                test("cancels the freeze after freeze timeout", function () {
                    exerciseFreeze();
                    sinon.assert.calledOnce(eyeosVdiClient.cancelFreeze);
                });

                test("dispatches vdiconnect.error", function () {
                    var called = false;
                    desktopBus.subscribe("vdiconnect.error", function () {
                        called = true;
                    });
                    exerciseFreeze();
                    assert(called);
                });

                test("adds the freeze timer once", function () {
                    exerciseFreeze();
                    exerciseFreeze();
                    sinon.assert.calledOnce(eyeosVdiClient.cancelFreeze);
                });

                test("doesn't set timers while reconnecting", function () {
                    eyeosVdiClient.getReconnecting.returns(true);
                    exerciseFreeze();
                    sinon.assert.notCalled(eyeosVdiClient.cancelFreeze);
                });

                function exerciseReconnect () {
                    sut.connectErrorSubscription();
                    desktopBus.dispatch("wm.connect.error", {});
                    clock.tick(settings.VDI_RECONNECTION_RETRY_TIME);
                }

                test("calls reconnect after reconnect interval", function () {
                    exerciseReconnect();
                    sinon.assert.calledWithExactly(eyeosVdiClient.reconnect, {
                        freeze: settings.VDI_RECONNECTION_FREEZE
                    });
                });
                test("cancelReconnectionTimer calls dispose", function () {
                    exerciseReconnect();
                    clock.tick(settings.VDI_RECONNECTION_CANCEL_TIME);
                    sinon.assert.calledOnce(sut.dispose);
                });

            });
        });

        suite("#connectReadySubscription", function () {
            test("adds the subscription to the list of subscriptions", function () {
                sut.connectReadySubscription();
                assert.equal(sut.subscriptions.length, 1);
            });


            suite("on wm.connect.ready", function () {
                var auxClearTimeout, auxClearInterval;

                setup(function() {
                    auxClearTimeout = window.clearTimeout;
                    auxClearInterval = window.clearInterval;
                    window.clearTimeout = sinon.spy();
                    window.clearInterval = sinon.spy();
                });

                teardown(function() {
                    window.clearTimeout = auxClearTimeout;
                    window.clearInterval = auxClearInterval;
                });

                function exerciseReady () {
                    sut.connectReadySubscription();
                    desktopBus.dispatch("wm.connect.ready");
                }

                test("setReconnectig to false", function() {
                    exerciseReady();
                    sinon.assert.calledWithExactly(eyeosVdiClient.setReconnecting, false);
                });

                test("dispatches vdiconnect.cancelError", function () {
                    var called = false;
                    desktopBus.subscribe("vdiconnect.cancelError", function () {
                        called = true;
                    });
                    exerciseReady();
                    assert(called);
                });

                test("clearTimeout has to be called twice if there is cancelReconnection", function() {
                    sut.cancelReconnectionTimer = 1;
                    exerciseReady();
                    assert(clearTimeout.calledTwice);
                });

                test("cancelReconnectionTimer has to be set to null", function() {
                    sut.cancelReconnectionTimer = 1;
                    exerciseReady();
                    assert.isNull(sut.cancelReconnectionTimer);
                });



                test("cancelFreezeTimer has to be set to null", function() {
                    sut.cancelReconnectionTimer = 1;
                    sut.cancelFreezeTimer = 1;
                    exerciseReady();
                    assert.isNull(sut.cancelFreezeTimer);
                });

                test("clearInterval has to be called once if there is intervalTimer", function() {
                    sut.intervalTimer = 1;
                    exerciseReady();
                    assert(clearInterval.calledOnce);
                });

                test("intervalTimer has to be set to null", function() {
                    sut.intervalTimer = 1;
                    exerciseReady();
                    assert.isNull(sut.intervalTimer);
                });
            });
        });

        suite("#start", function () {
            var $rootScope;

            setup(function() {
                $rootScope = {
                    $destroy: function() {},
                    unsubscribe: function() {}
                };
            });

            test("should call connectErrorSubscription", function() {
                var stub = sinon.stub(sut, "connectErrorSubscription");
                sut.start($rootScope);
                sinon.assert.called(sut.connectErrorSubscription);
            });

            test("should call connectReadySubscription", function() {
                var stub = sinon.stub(sut, "connectReadySubscription");
                sut.start($rootScope);
                sinon.assert.called(sut.connectReadySubscription);
            });
        });
    });
});
