'use strict';
/**
 * Copyright 2020 FreightTrust and Clearing Corporation
 * BSD-3 License - www.freighttrust.com
 */
/**
 * Add a carrier
 * @param {it.freighttrust.com.CreateCarrier} tx - the transaction to be processed
 * @transaction
 */
function createCarrier(tx) {
    // Create the resource
    var factory = getFactory();
    var resource = factory.newResource('it.freighttrust.com', 'Carrier', tx.Id);
    resource.Name = tx.Name;
    resource.Address = tx.Address;

    if (tx.Balance != null) {
        resource.Balance = tx.Balance;
    }
    if (tx.DetentionGraceHours != null) {
        resource.DetentionGraceHours = tx.DetentionGraceHours;
    }
    if (tx.DetentionRatePerHour != null) {
        resource.DetentionRatePerHour = tx.DetentionRatePerHour;
    }

    return getParticipantRegistry('it.freighttrust.com.Carrier')
        .then(function (participantRegistry) {
            // Add the resource to the resource participant registry.
            return participantRegistry.add(resource);
        }).then(function () {
            // emit a notification that an add has occured
            var notification = getFactory().newEvent('it.freighttrust.com', 'CreateCarrierNotification');
            notification.Type = "CreateCarrier";
            notification.Carrier = resource;
            emit(notification);
            return Promise.resolve()
        })
}

/**
 * Add a shipper
 * @param {it.freighttrust.com.CreateShipper} tx - the transaction to be processed
 * @transaction
 */
function createShipper(tx) {
    // Create the resource
    var factory = getFactory();
    var resource = factory.newResource('it.freighttrust.com', 'Shipper', tx.Id);
    resource.Name = tx.Name;
    resource.Address = tx.Address;

    if (tx.Balance != null) {
        resource.Balance = tx.Balance;
    }

    return getParticipantRegistry('it.freighttrust.com.Shipper')
        .then(function (participantRegistry) {
            // Add the resource to the resource participant registry.
            return participantRegistry.add(resource);
        }).then(function () {
            // emit a notification that an add has occured
            var notification = getFactory().newEvent('it.freighttrust.com', 'CreateShipperNotification');
            notification.Type = "CreateShipper";
            notification.Shipper = resource;
            emit(notification);
            return Promise.resolve()
        })
}

/**
 * Add a receiver
 * @param {it.freighttrust.com.CreateReceiver} tx - the transaction to be processed
 * @transaction
 */
function createReceiver(tx) {
    // Create the resource
    var factory = getFactory();
    var resource = factory.newResource('it.freighttrust.com', 'Receiver', tx.Id);
    resource.Name = tx.Name;
    resource.Address = tx.Address;

    if (tx.Balance != null) {
        resource.Balance = tx.Balance;
    }

    return getParticipantRegistry('it.freighttrust.com.Receiver')
        .then(function (participantRegistry) {
            // Add the resource to the resource participant registry.
            return participantRegistry.add(resource);
        }).then(function () {
            // emit a notification that an add has occured
            var notification = getFactory().newEvent('it.freighttrust.com', 'CreateReceiverNotification');
            notification.Type = "CreateReceiver";
            notification.Receiver = resource;
            emit(notification);
            return Promise.resolve()
        })
}

/**
 * Add a driver
 * @param {it.freighttrust.com.AddDriver} tx - the transaction to be processed
 * @transaction
 */
function addDriver(tx) {

    return getParticipantRegistry('it.freighttrust.com.Driver')
        .then(function (participantRegistry) {
            // Create the driver
            var factory = getFactory();
            var driver = factory.newResource('it.freighttrust.com', 'Driver', tx.Id);
            driver.CDLNumber = tx.CDLNumber;
            driver.FirstName = tx.FirstName;
            driver.LastName = tx.LastName;
            driver.DateOfBirth = tx.DateOfBirth;
            driver.Carrier = tx.Carrier;

            // emit a notification that an add has occured
            var notification = getFactory().newEvent('it.freighttrust.com', 'AddDriverNotification');
            notification.Type = "AddDriver";
            notification.Driver = driver;
            emit(notification);

            // Add the driver to the driver participant registry.
            return participantRegistry.add(driver);
        })
}

/**
 * Create a Driver Passport.
 * @param {it.freighttrust.com.CreateDriverPassport} create - the passport information to be created
 * @transaction
 */
function createDriverPassport(create) {

    // create the new passport
    var passport = getFactory().newResource('it.freighttrust.com', 'DriverPassport', create.Id);
    passport.Driver = create.Driver;
    passport.DrugAndAlchoholCompliance = create.DrugAndAlchoholCompliance;
    passport.MedicalCertification = create.MedicalCertification;
    passport.DriverLicenses = create.DriverLicenses;
    passport.DriverLicenseClasses = create.DriverLicenseClasses;
    // optional
    passport.ExpirationOfCertificates = (create.ExpirationOfCertificates || null);

    // update driver passport reference
    var driver = create.Driver;
    driver.Passport = passport;

    return getAssetRegistry('it.freighttrust.com.DriverPassport')
        .then(function (assetRegistry) {
            // persist the state of the passport
            return assetRegistry.add(passport);
        }).then(function () {
            // update Driver Passport reference
            return getParticipantRegistry('it.freighttrust.com.Driver');
        })
        .then(function (driverRegistry) {
            // save driver changes
            return driverRegistry.update(driver);
        }).then(function () {
            // emit a notification
            var notification = getFactory().newEvent('it.freighttrust.com', 'CreateDriverPassportNotification');
            notification.Type = "CreateDriverPassport";
            notification.Driver = driver;
            notification.Passport = passport;
            emit(notification);

            return Promise.resolve();
        })
}

/**
 * Track update passport
 * @param {it.freighttrust.com.UpdateDriverPassport} update - the update to be processed
 * @transaction
 */
function updateDriverPassport(update) {

    var save = false;

    if (update.MedicalCertification != null) {
        save = true;
        update.Passport.MedicalCertification = update.MedicalCertification;
    }

    if (update.DrugAndAlchoholCompliance != null) {
        save = true;
        update.Passport.DrugAndAlchoholCompliance = update.DrugAndAlchoholCompliance;
    }

    if (update.ExpirationOfCertificates != null) {
        save = true;
        update.Passport.ExpirationOfCertificates = update.ExpirationOfCertificates;
    }

    if (update.DriverLicenses != null) {
        save = true;
        update.Passport.DriverLicenses = update.DriverLicenses;
    }

    if (update.DriverLicenseClasses != null) {
        save = true;
        update.Passport.DriverLicenseClasses = update.DriverLicenseClasses;
    }

    // don't update registry if no changes are requested
    if (save === false) {
        return Promise.resolve();
    }

    return getAssetRegistry('it.freighttrust.com.DriverPassport')
        .then(function (assetRegistry) {

            // emit a notification that an update has occured
            var notification = getFactory().newEvent('it.freighttrust.com', 'UpdateDriverPassportNotification');
            notification.Type = "UpdateDriverPassportCarrier";
            notification.Passport = update.Passport;
            emit(notification);

            // persist the state of the passport
            return assetRegistry.update(update.Passport);
        })
}

/**
 * Track update driver
 * @param {it.freighttrust.com.ChangeDriverCarrier} tx - the transaction to be processed
 * @transaction
 */
function changeDriverCarrier(tx) {

    tx.Driver.Carrier = tx.NewCarrier;

    return getParticipantRegistry('it.freighttrust.com.Driver')
        .then(function (participantRegistry) {

            // emit a notification that an update has occured
            var notification = getFactory().newEvent('it.freighttrust.com', 'ChangeDriverCarrierNotification');
            notification.Type = "ChangeDriverCarrier";
            notification.Driver = tx.Driver;
            emit(notification);

            // persist the state of the driver
            return participantRegistry.update(tx.Driver);
        })
}

/**
 * Track remove driver carrier
 * @param {it.freighttrust.com.RemoveDriverCarrier} tx - the transaction to be processed
 * @transaction
 */
function removeDriverCarrier(tx) {

    tx.Driver.Carrier = null;

    return getParticipantRegistry('it.freighttrust.com.Driver')
        .then(function (participantRegistry) {

            // emit a notification that an update has occured
            var notification = getFactory().newEvent('it.freighttrust.com', 'RemoveDriverCarrierNotification');
            notification.Type = "RemoveDriverCarrier";
            notification.Driver = tx.Driver;
            emit(notification);

            // persist the state of the driver
            return participantRegistry.update(tx.Driver);
        })
}

/**
 * Create a Load.
 * @param {it.freighttrust.com.ListLoad} listing - the listing to be processed
 * @transaction
 */
function listLoad(listing) {
    return getAssetRegistry('it.freighttrust.com.Load')
        .then(function (assetRegistry) {

            // create the new load listing
            var load = getFactory().newResource('it.freighttrust.com', 'Load', listing.Id);
            load.Shipper = listing.Shipper;
            load.Receiver = listing.Receiver;
            load.TargetPrice = listing.TargetPrice;
            load.Description = listing.Description;
            load.ScheduledPickupDate = listing.ScheduledPickupDate;
            load.ScheduledDropOffDate = listing.ScheduledDropOffDate
            load.Completed = false;
            load.Accepted = false;

            // persist the state of the commodity
            return assetRegistry.add(load);
        })
}

/**
 * Create a Carrier Quote for a load
 * @param {it.freighttrust.com.SubmitQuote} tx - the load quote to be processed
 * @transaction
 */
function submitQuote(tx) {

    if (tx.Load.Accepted == true) {
        throw new Error('Load has already been Accepted');
    }

    // if (tx.Carrier.Balance < tx.Price) {
    //     throw new Error('Insufficient funds for quote');
    // }

    // TODO: Id generation
    var quote = getFactory().newResource('it.freighttrust.com', 'Quote', tx.Id);
    quote.Price = tx.Price;
    quote.Load = tx.Load;
    quote.Carrier = tx.Carrier;

    return getAssetRegistry('it.freighttrust.com.Quote')
        .then(function (assetRegistry) {
            // emit a notification that a load claim has occured
            var notification = getFactory().newEvent('it.freighttrust.com', 'QuoteNotification');
            notification.Type = "Quote";
            notification.Quote = quote;
            emit(notification);

            // add the quote
            return assetRegistry.add(quote);
        })
}

/**
 * Accept a Quote
 * @param {it.freighttrust.com.AcceptQuote} tx - the transaction to be processed
 * @transaction
 */
function acceptQuote(tx) {

    // set the new carrier of the load
    var load = tx.Quote.Load;
    load.Carrier = tx.Quote.Carrier
    load.Accepted = true;
    // TODO: escrow

    return getAssetRegistry('it.freighttrust.com.Load')
        .then(function (assetRegistry) {

            // emit a notification that a load claim has occured
            var notification = getFactory().newEvent('it.freighttrust.com', 'QuoteAcceptedNotification');
            notification.Type = "QuoteAccepted";
            notification.Quote = tx.Quote;
            emit(notification);

            // persist the state of the load
            return assetRegistry.update(load);
        })
}

/**
 * Assign a Driver to a Load
 * @param {it.freighttrust.com.AssignDriverToLoad} tx - the transaction to be processed
 * @transaction
 */
function assignDriverToLoad(tx) {
    // assign driver
    tx.Load.Driver = tx.Driver;
    return getAssetRegistry('it.freighttrust.com.Load')
        .then(function (assetRegistry) {
            // emit a notification that a driver has been assigned
            var notification = getFactory().newEvent('it.freighttrust.com', 'AssignDriverToLoadNotification');
            notification.Type = "AssignDriverToLoad";
            notification.Driver = tx.Driver;
            notification.Load = tx.Load;
            emit(notification);
            // persist the state of the load
            return assetRegistry.update(tx.Load);
        })
}

var _MS_PER_MINUTE = 60 * 1000;

function isDetention(detentionMinutes) {
    return detentionMinutes > 0;
}

// Gets the amount of detention minutes based on the scheduled time + grace period compared to the actual time the load was picked up or dropped off.
function getDetentionMinutes(scheduled, arrival, pickup, graceHours) {
    var scheduledDate = new Date(scheduled);
    var arrivalDate = new Date(arrival);

    var start = scheduledDate > arrivalDate ? scheduledDate : arrivalDate;
    var adjusted = addHours(start, graceHours);
    var pickupDate = new Date(pickup);
    var difference = Math.ceil((pickupDate - adjusted) / _MS_PER_MINUTE);
    return difference;
}

function addHours(date, hours) {
    var milliseconds = date.getTime() + (hours * 60 * _MS_PER_MINUTE);
    return new Date(milliseconds);
}

/**
 * Called by the Driver to log when they have arrived at the Origin and are waiting to pick up the Load.
 * @param {it.freighttrust.com.OriginArrival} tx - the transaction to be processed
 * @transaction
 */
function originArrival(tx) {
    // update date
    tx.Load.OriginArrivalDate = tx.DateOccured;
    return getAssetRegistry('it.freighttrust.com.Load')
        .then(function (assetRegistry) {
            // persist the state of the load
            return assetRegistry.update(tx.Load);
        }).then(function () {
            // emit a notification that a load event has occured
            var notification = getFactory().newEvent('it.freighttrust.com', 'OriginArrivalNotification');
            notification.Type = "OriginArrival";
            notification.DateOccured = tx.DateOccured;
            notification.Load = tx.Load;
            emit(notification);

            return Promise.resolve();
        })
}

/**
 * Called by the Shipper when the Load has been picked up by the Driver.
 * @param {it.freighttrust.com.LoadPickup} tx - the transaction to be processed
 * @transaction
 */
function loadPickup(tx) {
    // update date
    tx.Load.PickupDate = tx.DateOccured;
    // if driver arrived by ScheduledPickupDate and picked up after carrier.DetentionGraceHours past ScheduledPickupDate, emit detention notification
    var detentionMinutes = getDetentionMinutes(tx.Load.ScheduledPickupDate, tx.Load.OriginArrivalDate, tx.Load.PickupDate, tx.Load.Carrier.DetentionGraceHours);
    var detention = isDetention(detentionMinutes);
    return getAssetRegistry('it.freighttrust.com.Load')
        .then(function (assetRegistry) {
            // persist the state of the load
            return assetRegistry.update(tx.Load);
        }).then(function () {
            // TODO: don't need to get registry if not accepted
            return getAssetRegistry('it.freighttrust.com.Detention');
        })
        .then(function (detentionRegistry) {
            // return early if not detention
            if (!detention) {
                return Promise.resolve();
            }
            // TODO: id generation
            var det = getFactory().newResource('it.freighttrust.com', 'Detention', 'D_' + tx.Load.Id + '_' + 'Origin');
            det.Type = 'Origin';
            det.Load = tx.Load;
            det.Minutes = detentionMinutes;
            det.IsDetention = detention;
            det.ScheduledDate = tx.Load.ScheduledPickupDate;
            det.ActualDate = tx.Load.PickupDate;
            det.GraceMinutes = tx.Load.Carrier.DetentionGraceHours * 60;
            det.RatePerHour = tx.Load.Carrier.DetentionRatePerHour;
            det.Paid = false;
            return detentionRegistry.add(det);
        }).then(function () {
            // emit a notification that a load event has occured
            var notification = getFactory().newEvent('it.freighttrust.com', 'LoadPickupNotification');
            notification.Type = "LoadPickup";
            notification.DateOccured = tx.DateOccured;
            notification.Load = tx.Load;
            notification.Detention = detention;
            emit(notification);

            return Promise.resolve();
        })
}

/**
 * Called by the Driver when they have arrived at the Destination and are waiting to drop off the Load.
 * @param {it.freighttrust.com.DestinationArrival} tx - the transaction to be processed
 * @transaction
 */
function destinationArrival(tx) {
    // update date
    tx.Load.DestinationArrivalDate = tx.DateOccured;
    return getAssetRegistry('it.freighttrust.com.Load')
        .then(function (assetRegistry) {
            // persist the state of the load
            return assetRegistry.update(tx.Load);
        }).then(function () {
            // emit a notification that a load event has occured
            var notification = getFactory().newEvent('it.freighttrust.com', 'DestinationArrivalNotification');
            notification.Type = "DestinationArrival";
            notification.DateOccured = tx.DateOccured;
            notification.Load = tx.Load;
            emit(notification);

            return Promise.resolve();
        })
}

/**
 * Called by the Receiver when the Driver has dropped off the Load.
 * @param {it.freighttrust.com.LoadDropOff} tx - the transaction to be processed
 * @transaction
 */
function loadDropOff(tx) {
    // update date
    tx.Load.DropOffDate = tx.DateOccured;
    tx.Load.Completed = true;
    // if driver arrived by ScheduledDropOffDate and picked up after carrier.DetentionGraceHours past ScheduledDropOffDate, emit detention notification
    var detentionMinutes = getDetentionMinutes(tx.Load.ScheduledDropOffDate, tx.Load.DestinationArrivalDate, tx.Load.DropOffDate, tx.Load.Carrier.DetentionGraceHours);
    var detention = isDetention(detentionMinutes);
    return getAssetRegistry('it.freighttrust.com.Load')
        .then(function (assetRegistry) {
            // persist the state of the load
            return assetRegistry.update(tx.Load);
        }).then(function () {
            // TODO: don't need to get registry if not accepted
            return getAssetRegistry('it.freighttrust.com.Detention');
        }).then(function (detentionRegistry) {
            // return early if not detention
            if (!detention) {
                return Promise.resolve();
            }
            // TODO: id generation
            var det = getFactory().newResource('it.freighttrust.com', 'Detention', 'D_' + tx.Load.Id + '_' + 'Destination');
            det.Type = 'Destination';
            det.Load = tx.Load;
            det.Minutes = detentionMinutes;
            det.IsDetention = detention;
            det.ScheduledDate = tx.Load.ScheduledDropOffDate;
            det.ActualDate = tx.Load.DropOffDate;
            det.GraceMinutes = tx.Load.Carrier.DetentionGraceHours * 60;
            det.RatePerHour = tx.Load.Carrier.DetentionRatePerHour;
            det.Paid = false;
            return detentionRegistry.add(det);
        }).then(function () {
            // emit a notification that a load event has occured
            var notification = getFactory().newEvent('it.freighttrust.com', 'LoadDropOffNotification');
            notification.Type = "LoadDropOff";
            notification.DateOccured = tx.DateOccured;
            notification.Load = tx.Load;
            notification.Detention = detention;
            emit(notification);

            return Promise.resolve();
        })
}

/**
 * Add a Detention asset manually.
 * @param {it.freighttrust.com.CreateDetention} tx - the transaction to be processed
 * @transaction
 */
function createDetention(tx) {
    // Create the resource
    var factory = getFactory();
    var detention = factory.newResource('it.freighttrust.com', 'Detention', tx.Id);
    detention.Id = tx.Id;
    detention.Type = tx.Type;
    detention.Minutes = tx.Minutes;
    detention.IsDetention = tx.IsDetention;
    detention.ScheduledDate = tx.ScheduledDate;
    detention.ActualDate = tx.ActualDate;
    detention.GraceMinutes = tx.GraceMinutes;
    detention.RatePerHour = tx.RatePerHour;
    detention.Paid = tx.Paid;
    detention.Load = tx.Load;

    return getAssetRegistry('it.freighttrust.com.Detention')
        .then(function (assetRegistry) {
            // Add the detention to the resource asset registry.
            return assetRegistry.add(detention);
        }).then(function () {
            // emit a notification that an add has occured
            var notification = getFactory().newEvent('it.freighttrust.com', 'CreateDetentionNotification');
            notification.Type = "CreateDetention";
            notification.Detention = detention;
            emit(notification);
            return Promise.resolve();
        })
}
