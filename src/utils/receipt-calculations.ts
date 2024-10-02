import { RideReceiptEntity } from "../api/ride-receipt/entities/ride-receipt.entity";
import { EPricingItems } from "../enums/ho-pricing-items.enum";

export function calculateRideReceiptCharges(rideReceipt: RideReceiptEntity) {
    let tripMileage = 0,
      mileageCharges = 0,
      waitTimeCharges = 0,
      subscriptionCharges = 0,
      cancellationCharges = 0,
      overnightCharges = 0,
      noShowCharges = 0,
      inclementWeatherCharges = 0,
      sameDayCancellationCharges = 0,
      holidayCharges = 0,
      totalRideCharges = 0;

    for (const item of rideReceipt.receiptItems) {
      totalRideCharges += item.amount;
      
      switch (item.type) {
        case EPricingItems.miles0_3:
        case EPricingItems.moreThen3Miles:
        case EPricingItems.miles0_10:
        case EPricingItems.miles10_25:
        case EPricingItems.miles0_25:
          tripMileage += item.amount;
          break;
        case EPricingItems.milesSurcharge35_90:
        case EPricingItems.milesSurcharge90Plus:
        case EPricingItems.milesSurcharge25_90:
          mileageCharges += item.amount;
          break;
        case EPricingItems.waitTime:
          waitTimeCharges += item.amount;
          break;
        case EPricingItems.riderNoShow:
          noShowCharges += item.amount;
          break;
        case 'Subscription':
          subscriptionCharges += item.amount;
          break;
        case EPricingItems.sameDayCancellation:
          cancellationCharges += item.amount;
          sameDayCancellationCharges += item.amount;
          break;
        case EPricingItems.overnightRide:
          overnightCharges += item.amount;
          break;
        case EPricingItems.inclementWeather:
          inclementWeatherCharges += item.amount;
          break;
        case EPricingItems.holiday:
          holidayCharges += item.amount;
          break;
      }
    }

    return {
      tripMileage,
      mileageCharges,
      waitTimeCharges,
      subscriptionCharges,
      cancellationCharges,
      overnightCharges,
      noShowCharges,
      inclementWeatherCharges,
      sameDayCancellationCharges,
      holidayCharges,
      totalRideCharges
    };
  }